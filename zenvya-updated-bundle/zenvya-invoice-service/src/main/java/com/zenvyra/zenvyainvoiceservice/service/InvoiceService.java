package com.zenvyra.zenvyainvoiceservice.service;

import com.zenvyra.zenvyainvoiceservice.dto.CreateInvoiceRequest;
import com.zenvyra.zenvyainvoiceservice.dto.InvoiceItemRequest;
import com.zenvyra.zenvyainvoiceservice.dto.InvoiceItemResponse;
import com.zenvyra.zenvyainvoiceservice.dto.InvoiceResponse;
import com.zenvyra.zenvyainvoiceservice.entity.Invoice;
import com.zenvyra.zenvyainvoiceservice.entity.InvoiceItem;
import com.zenvyra.zenvyainvoiceservice.entity.InvoiceSequence;
import com.zenvyra.zenvyainvoiceservice.entity.InvoiceStatus;
import com.zenvyra.zenvyainvoiceservice.entity.TaxTreatment;
import com.zenvyra.zenvyainvoiceservice.execption.BadRequestException;
import com.zenvyra.zenvyainvoiceservice.execption.ResourceNotFoundException;
import com.zenvyra.zenvyainvoiceservice.repository.InvoiceRepository;
import com.zenvyra.zenvyainvoiceservice.repository.InvoiceSequenceRepository;
import com.zenvyra.zenvyainvoiceservice.security.CurrentUser;
import com.zenvyra.zenvyainvoiceservice.service.integration.CustomerClient;
import com.zenvyra.zenvyainvoiceservice.service.integration.OrganizationClient;
import com.zenvyra.zenvyainvoiceservice.service.integration.ProductClient;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private static final int SCALE = 2;

    private final InvoiceRepository invoiceRepository;
    private final InvoiceSequenceRepository invoiceSequenceRepository;
    private final InvoiceCalculationService calculationService;
    private final OrganizationClient organizationClient;
    private final CustomerClient customerClient;
    private final ProductClient productClient;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            InvoiceSequenceRepository invoiceSequenceRepository,
            InvoiceCalculationService calculationService,
            OrganizationClient organizationClient,
            CustomerClient customerClient,
            ProductClient productClient
    ) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceSequenceRepository = invoiceSequenceRepository;
        this.calculationService = calculationService;
        this.organizationClient = organizationClient;
        this.customerClient = customerClient;
        this.productClient = productClient;
    }

    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request, String selectedOrganizationId) {
        UUID organizationId = CurrentUser.getOrganizationId(selectedOrganizationId);

        OrganizationClient.OrganizationData organization = organizationClient.getOrganization(organizationId);
        validateOrganization(organization, organizationId);

        CustomerClient.CustomerData customer = customerClient.getCustomer(
                request.customerId(), organizationId.toString());
        validateCustomer(customer, organizationId);

        String sellerState = organization.state();
        String sellerStateCode = firstNonBlank(
                organization.stateCode(), IndianStateCodeResolver.resolve(organization.state()));

        String placeOfSupplyCode = requireValue(request.placeOfSupplyCode(),
                "Place of supply state code is required");
        boolean interstate = isInterstate(sellerStateCode, placeOfSupplyCode);

        Invoice invoice = new Invoice();
        invoice.setId(UUID.randomUUID());
        invoice.setOrganizationId(organizationId);
        invoice.setInvoiceNumber(generateInvoiceNumber(organizationId));
        invoice.setInvoiceDate(request.invoiceDate());
        invoice.setDueDate(request.dueDate());
        invoice.setStatus(InvoiceStatus.DRAFT);

        // Seller is always snapshotted from Organization Service.
        invoice.setSellerName(requireValue(organization.name(), "Organization name is required"));
        invoice.setSellerGstin(organization.taxNumber());
        invoice.setSellerAddress(buildAddress(organization));
        invoice.setSellerState(sellerState);
        invoice.setSellerStateCode(sellerStateCode);
        invoice.setSellerEmail(organization.email());
        invoice.setSellerMobile(organization.mobile());

        // Buyer is always snapshotted from Customer Service.
        invoice.setBuyerName(requireValue(customer.name(), "Customer name is required"));
        invoice.setBuyerGstin(customer.taxNumber());
        invoice.setBuyerAddress(customer.billingAddress());
        invoice.setBuyerEmail(customer.email());
        invoice.setBuyerMobile(customer.mobile());

        // Customer Service currently does not expose state/stateCode in its contract.
        invoice.setBuyerState(null);
        invoice.setBuyerStateCode(null);

        invoice.setShippingName(firstNonBlank(request.shippingName(), customer.name()));
        invoice.setShippingAddress(firstNonBlank(request.shippingAddress(), customer.shippingAddress(), customer.billingAddress()));
        invoice.setShippingState(request.shippingState());
        invoice.setShippingStateCode(request.shippingStateCode());

        invoice.setPlaceOfSupply(request.placeOfSupply());
        invoice.setPlaceOfSupplyCode(placeOfSupplyCode);
        invoice.setReverseCharge(Boolean.TRUE.equals(request.reverseCharge()));

        // These are presentation/payment settings and are snapshotted into the invoice.
        invoice.setBankName(request.bankName());
        invoice.setAccountNumber(request.accountNumber());
        invoice.setIfscCode(request.ifscCode());
        invoice.setAccountType(request.accountType());
        invoice.setBankBranch(request.bankBranch());
        invoice.setTermsAndConditions(request.termsAndConditions());
        invoice.setAuthorizedSignatoryName(firstNonBlank(request.authorizedSignatoryName(), organization.name()));

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal taxableAmount = BigDecimal.ZERO;
        BigDecimal cgstAmount = BigDecimal.ZERO;
        BigDecimal sgstAmount = BigDecimal.ZERO;
        BigDecimal igstAmount = BigDecimal.ZERO;
        BigDecimal grandTotal = BigDecimal.ZERO;

        int lineNumber = 1;
        for (InvoiceItemRequest requestItem : request.items()) {
            ProductClient.ProductData product = productClient.getProduct(
                    requestItem.productId(), organizationId.toString());
            validateProduct(product, organizationId);

            BigDecimal effectiveTaxRate = requestItem.taxTreatment() == TaxTreatment.NONE
                    ? BigDecimal.ZERO
                    : firstNonNull(requestItem.taxRate(), product.taxRate(), BigDecimal.ZERO);

            InvoiceCalculationService.CalculatedItem calculated = calculationService.calculateItem(
                    requestItem.quantity(),
                    product.sellingPrice(),
                    requestItem.discountAmount(),
                    requestItem.taxTreatment(),
                    effectiveTaxRate,
                    interstate
            );

            InvoiceItem item = new InvoiceItem();
            item.setId(UUID.randomUUID());
            item.setInvoice(invoice);
            item.setLineNumber(lineNumber++);
            item.setProductId(product.id());
            item.setProductCode(product.productCode());
            item.setProductName(product.name());
            item.setDescription(product.description());
            item.setHsnSac(null); // Product Service currently does not expose HSN/SAC.
            item.setQuantity(requestItem.quantity());
            item.setUnit(product.unit());
            item.setUnitPrice(money(product.sellingPrice()));
            item.setDiscountAmount(calculated.discountAmount());
            item.setTaxableValue(calculated.taxableValue());
            item.setTaxTreatment(requestItem.taxTreatment());
            item.setTaxRate(calculated.taxRate());
            item.setCgstRate(calculated.cgstRate());
            item.setCgstAmount(calculated.cgstAmount());
            item.setSgstRate(calculated.sgstRate());
            item.setSgstAmount(calculated.sgstAmount());
            item.setIgstRate(calculated.igstRate());
            item.setIgstAmount(calculated.igstAmount());
            item.setTotalAmount(calculated.totalAmount());
            invoice.getItems().add(item);

            subtotal = subtotal.add(calculated.grossAmount());
            discountAmount = discountAmount.add(calculated.discountAmount());
            taxableAmount = taxableAmount.add(calculated.taxableValue());
            cgstAmount = cgstAmount.add(calculated.cgstAmount());
            sgstAmount = sgstAmount.add(calculated.sgstAmount());
            igstAmount = igstAmount.add(calculated.igstAmount());
            grandTotal = grandTotal.add(calculated.totalAmount());
        }

        invoice.setSubtotal(money(subtotal));
        invoice.setDiscountAmount(money(discountAmount));
        invoice.setTaxableAmount(money(taxableAmount));
        invoice.setCgstAmount(money(cgstAmount));
        invoice.setSgstAmount(money(sgstAmount));
        invoice.setIgstAmount(money(igstAmount));

        BigDecimal roundOff = BigDecimal.ZERO.setScale(SCALE);
        invoice.setRoundOff(roundOff);
        invoice.setGrandTotal(money(grandTotal.add(roundOff)));
        invoice.setAmountInWords(IndianAmountInWords.toWords(invoice.getGrandTotal()));

        LocalDateTime now = LocalDateTime.now();
        invoice.setCreatedAt(now);
        invoice.setUpdatedAt(now);

        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse getInvoice(UUID invoiceId, String selectedOrganizationId) {
        UUID organizationId = CurrentUser.getOrganizationId(selectedOrganizationId);
        Invoice invoice = invoiceRepository.findByIdAndOrganizationId(invoiceId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return toResponse(invoice);
    }

    @Transactional
    public List<InvoiceResponse> getInvoices(String selectedOrganizationId) {
        UUID organizationId = CurrentUser.getOrganizationId(selectedOrganizationId);
        return invoiceRepository.findAllByOrganizationIdOrderByInvoiceDateDesc(organizationId)
                .stream().map(this::toResponse).toList();
    }

    private String generateInvoiceNumber(UUID organizationId) {
        InvoiceSequence sequence = invoiceSequenceRepository.findForUpdate(organizationId).orElse(null);
        if (sequence == null) {
            sequence = new InvoiceSequence();
            sequence.setOrganizationId(organizationId);
            sequence.setNextNumber(1L);
        }
        long number = sequence.getNextNumber();
        sequence.setNextNumber(number + 1);
        invoiceSequenceRepository.save(sequence);
        return String.format("INV-%06d", number);
    }

    private void validateOrganization(OrganizationClient.OrganizationData organization, UUID organizationId) {
        if (organization == null || organization.id() == null || !organizationId.equals(organization.id())) {
            throw new BadRequestException("Organization does not belong to the selected workspace");
        }
        if (!"ACTIVE".equalsIgnoreCase(organization.status())) {
            throw new BadRequestException("Organization is not active");
        }
    }

    private void validateCustomer(CustomerClient.CustomerData customer, UUID organizationId) {
        if (customer == null) throw new ResourceNotFoundException("Customer not found");
        if (!organizationId.equals(customer.organizationId())) {
            throw new BadRequestException("Customer does not belong to the selected organization");
        }
        if (!"ACTIVE".equalsIgnoreCase(customer.status())) {
            throw new BadRequestException("Customer is not active: " + customer.name());
        }
    }

    private void validateProduct(ProductClient.ProductData product, UUID organizationId) {
        if (product == null) throw new ResourceNotFoundException("Product not found");
        if (!organizationId.equals(product.organizationId())) {
            throw new BadRequestException("Product does not belong to the selected organization");
        }
        if (!"ACTIVE".equalsIgnoreCase(product.status())) {
            throw new BadRequestException("Product is not active: " + product.name());
        }
        if (product.sellingPrice() == null || product.sellingPrice().signum() < 0) {
            throw new BadRequestException("Product selling price is invalid: " + product.name());
        }
    }

    private boolean isInterstate(String sellerStateCode, String placeOfSupplyCode) {
        if (sellerStateCode == null || sellerStateCode.isBlank()) {
            throw new BadRequestException("Organization state code is required for GST calculation");
        }
        return !sellerStateCode.trim().equalsIgnoreCase(placeOfSupplyCode.trim());
    }

    private String buildAddress(OrganizationClient.OrganizationData organization) {
        StringBuilder address = new StringBuilder();
        append(address, organization.addressLine1());
        append(address, organization.addressLine2());
        append(address, organization.city());
        append(address, organization.state());
        append(address, organization.country());
        append(address, organization.postalCode());
        return address.toString();
    }

    private void append(StringBuilder builder, String value) {
        if (value != null && !value.isBlank()) {
            if (builder.length() > 0) builder.append(", ");
            builder.append(value.trim());
        }
    }

    private String requireValue(String value, String message) {
        if (value == null || value.isBlank()) throw new BadRequestException(message);
        return value.trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }

    @SafeVarargs
    private final <T> T firstNonNull(T... values) {
        for (T value : values) if (value != null) return value;
        return null;
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(SCALE, RoundingMode.HALF_UP);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        List<InvoiceItemResponse> items = invoice.getItems().stream()
                .map(item -> new InvoiceItemResponse(
                        item.getId(), item.getLineNumber(), item.getProductId(), item.getProductCode(),
                        item.getProductName(), item.getDescription(), item.getHsnSac(), item.getQuantity(),
                        item.getUnit(), item.getUnitPrice(), item.getDiscountAmount(), item.getTaxableValue(),
                        item.getTaxTreatment(), item.getTaxRate(), item.getCgstRate(), item.getCgstAmount(),
                        item.getSgstRate(), item.getSgstAmount(), item.getIgstRate(), item.getIgstAmount(),
                        item.getTotalAmount()))
                .toList();

        return new InvoiceResponse(
                invoice.getId(), invoice.getOrganizationId(), invoice.getInvoiceNumber(), invoice.getInvoiceDate(),
                invoice.getDueDate(), invoice.getStatus(), invoice.getSellerName(), invoice.getSellerGstin(),
                invoice.getSellerAddress(), invoice.getSellerState(), invoice.getSellerStateCode(), invoice.getSellerEmail(),
                invoice.getSellerMobile(), invoice.getBuyerName(), invoice.getBuyerGstin(), invoice.getBuyerAddress(),
                invoice.getBuyerState(), invoice.getBuyerStateCode(), invoice.getBuyerEmail(), invoice.getBuyerMobile(),
                invoice.getShippingName(), invoice.getShippingAddress(), invoice.getShippingState(), invoice.getShippingStateCode(),
                invoice.getPlaceOfSupply(), invoice.getPlaceOfSupplyCode(), invoice.getReverseCharge(), invoice.getSubtotal(),
                invoice.getDiscountAmount(), invoice.getTaxableAmount(), invoice.getCgstAmount(), invoice.getSgstAmount(),
                invoice.getIgstAmount(), invoice.getRoundOff(), invoice.getGrandTotal(), invoice.getAmountInWords(),
                invoice.getBankName(), invoice.getAccountNumber(), invoice.getIfscCode(), invoice.getAccountType(),
                invoice.getBankBranch(), invoice.getTermsAndConditions(), invoice.getAuthorizedSignatoryName(), items,
                invoice.getCreatedAt(), invoice.getUpdatedAt());
    }
}
