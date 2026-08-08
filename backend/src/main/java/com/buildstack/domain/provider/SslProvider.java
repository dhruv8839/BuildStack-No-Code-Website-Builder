package com.buildstack.domain.provider;

import com.buildstack.domain.enums.SslStatus;

public interface SslProvider {
    /**
     * Requests SSL certificate issuance for the given hostname.
     * @param hostname The domain to issue the certificate for
     * @return The resulting SSL status
     */
    SslStatus issueCertificate(String hostname);
}
