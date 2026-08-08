package com.buildstack.generation.validation;

import com.buildstack.component.entity.Component;
import com.buildstack.project.entity.Page;
import com.buildstack.project.entity.Project;
import com.buildstack.publishing.entity.WebsiteVersion;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class GenerationValidator {

    public void validate(WebsiteVersion version) {
        if (version == null) {
            throw new GenerationValidationException("WebsiteVersion cannot be null.");
        }
        
        Project project = version.getProject();
        if (project == null) {
            throw new GenerationValidationException("Project cannot be null for version.");
        }

        Set<Page> pages = project.getPages();
        if (pages == null || pages.isEmpty()) {
            throw new GenerationValidationException("Project has no pages.");
        }

        boolean hasHomePage = false;
        Set<String> slugs = new HashSet<>();
        
        for (Page page : pages) {
            if (page.isHomePage()) {
                hasHomePage = true;
            }
            if (!slugs.add(page.getSlug())) {
                throw new GenerationValidationException("Duplicate slug found: " + page.getSlug());
            }
            validatePage(page);
        }
        
        if (!hasHomePage) {
            throw new GenerationValidationException("Project is missing a home page.");
        }
    }

    private void validatePage(Page page) {
        Set<Component> components = page.getComponents();
        if (components != null) {
            for (Component component : components) {
                validateComponent(component);
            }
        }
    }

    private void validateComponent(Component component) {
        // Component logic specific to generation
        if (component.getType() == null) {
            throw new GenerationValidationException("Component type cannot be null for component: " + component.getId());
        }
        
        // Simple circular reference check could be done here if needed
        // Since it's a tree mapped by JPA, actual circular refs usually cause StackOverflow or Hibernate issues
        // But for structural integrity, we assume JPA model is correct unless it's violated.
    }
}
