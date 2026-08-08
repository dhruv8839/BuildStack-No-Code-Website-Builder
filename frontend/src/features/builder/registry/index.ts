import { ComponentRegistry } from './ComponentRegistry';
import { HeadingConfig } from './components/heading';
import { ParagraphConfig } from './components/paragraph';
import { ButtonConfig } from './components/button';
import { ImageConfig } from './components/image';
import { ContainerConfig } from './components/container';
import { SpacerConfig } from './components/spacer';
import { RootConfig } from './components/root';
import { VideoConfig } from './components/video';
import { IconConfig } from './components/icon';
import { DividerConfig } from './components/divider';
import { FormConfig } from './components/form';
import { AccordionConfig } from './components/accordion';
import { TabsConfig } from './components/tabs';

// Register all core components
ComponentRegistry.register(RootConfig);
ComponentRegistry.register(HeadingConfig);
ComponentRegistry.register(ParagraphConfig);
ComponentRegistry.register(ButtonConfig);
ComponentRegistry.register(ImageConfig);
ComponentRegistry.register(ContainerConfig);
ComponentRegistry.register(SpacerConfig);
ComponentRegistry.register(VideoConfig);
ComponentRegistry.register(IconConfig);
ComponentRegistry.register(DividerConfig);
ComponentRegistry.register(FormConfig);
ComponentRegistry.register(AccordionConfig);
ComponentRegistry.register(TabsConfig);

export { ComponentRegistry };
