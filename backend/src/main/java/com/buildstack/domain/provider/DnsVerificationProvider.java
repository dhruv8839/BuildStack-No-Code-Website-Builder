package com.buildstack.domain.provider;

import com.buildstack.domain.enums.DomainVerificationStatus;

public interface DnsVerificationProvider {
    /**
     * Triggers the verification process for the given hostname.
     * @param hostname The domain to verify
     * @return The resulting status of the verification check
     */
    DomainVerificationStatus verifyDomain(String hostname);
}
