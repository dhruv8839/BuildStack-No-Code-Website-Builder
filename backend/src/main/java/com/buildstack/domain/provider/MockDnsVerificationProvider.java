package com.buildstack.domain.provider;

import com.buildstack.domain.enums.DomainVerificationStatus;
import org.springframework.stereotype.Service;

@Service
public class MockDnsVerificationProvider implements DnsVerificationProvider {
    
    @Override
    public DomainVerificationStatus verifyDomain(String hostname) {
        // In a real implementation, this would query a DNS provider API (like Route53 or Cloudflare)
        // For this mock abstraction, we just return VERIFIED immediately if it's a valid format.
        if (hostname == null || hostname.isBlank() || !hostname.contains(".")) {
            return DomainVerificationStatus.FAILED;
        }
        return DomainVerificationStatus.VERIFIED;
    }
}
