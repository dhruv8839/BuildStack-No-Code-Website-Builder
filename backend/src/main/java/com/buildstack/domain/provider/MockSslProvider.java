package com.buildstack.domain.provider;

import com.buildstack.domain.enums.SslStatus;
import org.springframework.stereotype.Service;

@Service
public class MockSslProvider implements SslProvider {

    @Override
    public SslStatus issueCertificate(String hostname) {
        // In a real implementation, this would talk to Let's Encrypt or ACM
        // For this mock abstraction, we just return ACTIVE if the hostname is somewhat valid
        if (hostname == null || hostname.isBlank()) {
            return SslStatus.FAILED;
        }
        return SslStatus.ACTIVE;
    }
}
