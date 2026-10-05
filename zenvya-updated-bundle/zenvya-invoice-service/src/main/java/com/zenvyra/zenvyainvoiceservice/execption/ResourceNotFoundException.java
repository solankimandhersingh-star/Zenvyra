package com.zenvyra.zenvyainvoiceservice.execption;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
