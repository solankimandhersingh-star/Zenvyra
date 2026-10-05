package com.zenvyra.zenvyainvoiceservice.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class IndianAmountInWords {
    private static final String[] ONES = {"", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"};
    private static final String[] TENS = {"", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"};

    private IndianAmountInWords() {}

    public static String toWords(BigDecimal amount) {
        if (amount == null) return "Zero Rupees Only";
        BigDecimal value = amount.setScale(2, RoundingMode.HALF_UP);
        long rupees = value.longValue();
        int paise = value.remainder(BigDecimal.ONE).movePointRight(2).intValue();
        String result = numberToWords(rupees) + " Rupees";
        if (paise > 0) result += " and " + numberToWords(paise) + " Paise";
        return result + " Only";
    }

    private static String numberToWords(long n) {
        if (n == 0) return "Zero";
        StringBuilder s = new StringBuilder();
        if (n >= 10_000_000) { s.append(numberToWords(n / 10_000_000)).append(" Crore "); n %= 10_000_000; }
        if (n >= 100_000) { s.append(numberToWords(n / 100_000)).append(" Lakh "); n %= 100_000; }
        if (n >= 1_000) { s.append(numberToWords(n / 1_000)).append(" Thousand "); n %= 1_000; }
        if (n >= 100) { s.append(numberToWords(n / 100)).append(" Hundred "); n %= 100; }
        if (n > 0) {
            if (s.length() > 0) s.append("and ");
            if (n < 20) s.append(ONES[(int)n]);
            else s.append(TENS[(int)n / 10]).append(n % 10 == 0 ? "" : " " + ONES[(int)n % 10]);
        }
        return s.toString().trim().replaceAll("\\s+", " ");
    }
}
