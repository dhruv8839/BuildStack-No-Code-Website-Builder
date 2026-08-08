import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../app/store';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { updateNodeProperty, removeNode, clearNodeStyleProperty } from '../state/builderSlice';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Trash2, Monitor, Tablet, Smartphone, X, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import type { PropertySchema } from '../registry/types';
import { useResolvedStyle } from '../hooks/useResolvedStyle';
import type { Viewport } from '../state/builderSlice';
import { useParams } from 'react-router-dom';
import { useGetProjectQuery } from '../../projects/projectsApiSlice';
import { useGetPagesForProjectQuery } from '../../projects/pagesApiSlice';
import { useUploadAssetMutation } from '../../assets/assetsApiSlice';
import { Upload, Loader2, Link2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ICON_OPTIONS } from '../registry/components/icon';

// ── Viewport badge config ────────────────────────────────────────────────────
const VIEWPORT_CONFIG: Record<Viewport, { label: string; Icon: any; color: string; bg: string }> = {
  desktop: { label: 'Desktop', Icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  tablet:  { label: 'Tablet',  Icon: Tablet,  color: 'text-purple-500', bg: 'bg-purple-500/10' },
  mobile:  { label: 'Mobile',  Icon: Smartphone, color: 'text-green-500', bg: 'bg-green-500/10' },
};

export function PropertyPanel() {
  const selectedNodeId = useSelector((state: RootState) => state.builder.selectedNodeId);
  const node = useSelector((state: RootState) => selectedNodeId ? state.builder.nodes[selectedNodeId] : null);
  const viewport = useSelector((state: RootState) => state.builder.viewport);
  const dispatch = useDispatch();

  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useGetProjectQuery(projectId!);
  const { data: projectPages } = useGetPagesForProjectQuery(projectId!, { skip: !projectId });
  const [uploadAsset, { isLoading: isUploading }] = useUploadAssetMutation();

  // Use centralized resolution to know what's inherited vs overridden
  const { isInherited, getInheritedValue } = useResolvedStyle(
    node ?? { style: { desktop: {}, tablet: {}, mobile: {} } } as any,
    viewport
  );

  if (!node) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--studio-border)', flexShrink: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--studio-text)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Properties</p>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, marginBottom: 12,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22 }}>🎯</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--studio-text-muted)', marginBottom: 6 }}>Nothing selected</p>
          <p style={{ fontSize: 11, color: 'var(--studio-text-subtle)', lineHeight: 1.5 }}>
            Click any element on the canvas to view and edit its properties
          </p>
        </div>
      </div>
    );
  }

  const config = ComponentRegistry.getConfig(node.type);
  if (!config) return null;

  const vp = VIEWPORT_CONFIG[viewport];
  const VpIcon = vp.Icon;

  const handleChange = (section: 'content' | 'style' | 'settings', property: string, value: any) => {
    let sanitizedValue = value;

    // Logical Property Boundaries & Validation
    if (section === 'style' && (property === 'width' || property === 'maxWidth')) {
      if (node.type === 'root') {
        sanitizedValue = '100%';
      } else if (typeof value === 'string' && value.trim() !== '') {
        const numMatch = value.match(/^(-?\d+(\.\d+)?)(px|%|vw|rem|em)?$/);
        if (numMatch) {
          const num = parseFloat(numMatch[1]);
          const unit = numMatch[3] || 'px';
          if (unit === 'px' && num > 1440) {
            sanitizedValue = '1440px';
          } else if (unit === '%' && num > 100) {
            sanitizedValue = '100%';
          } else if (num < 0) {
            sanitizedValue = '0px';
          }
        }
      }
    }

    dispatch(updateNodeProperty({ id: node.id, section, property, value: sanitizedValue, viewport }));
  };

  const handleClearOverride = (property: string) => {
    dispatch(clearNodeStyleProperty({ id: node.id, property, viewport }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: 'content' | 'style' | 'settings', propertyName: string) => {
    const file = e.target.files?.[0];
    if (!file || !project?.workspaceId) return;

    try {
      const response = await uploadAsset({ workspaceId: project.workspaceId, file }).unwrap();
      handleChange(section, propertyName, response.url);
    } catch (err) {
      console.error("Failed to upload image", err);
    }
  };

  const renderField = (section: 'content' | 'style' | 'settings', schema: PropertySchema) => {
    const isStyleSection = section === 'style';
    const isResponsive = isStyleSection && schema.responsive;

    // Determine current value: for style, look at current viewport's direct overrides
    let currentValue: string;
    if (isStyleSection) {
      // Raw value in this viewport (not resolved — so we can detect overrides vs inheritance)
      currentValue = node.style[viewport]?.[schema.name] ?? '';
    } else {
      currentValue = node[section]?.[schema.name] ?? '';
    }

    const inherited = isResponsive ? isInherited(schema.name) : false;
    const inheritedValue = isResponsive ? getInheritedValue(schema.name) : undefined;

    // Display value: show override if exists, otherwise show inherited as placeholder
    const displayValue = currentValue !== '' ? currentValue : (inherited ? inheritedValue ?? '' : '');

    // Wrapper classes to indicate inherited state
    const fieldWrapperClass = inherited ? 'opacity-70' : '';
    const labelSuffix = inherited ? <span className="text-[9px] font-normal text-muted-foreground ml-1 italic">(inherited)</span> : null;

    const clearButton = isResponsive && !inherited && viewport !== 'desktop' && currentValue !== '' ? (
      <button
        title="Clear override — resume inheritance"
        onClick={() => handleClearOverride(schema.name)}
        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
      >
        <X className="h-3 w-3" />
      </button>
    ) : null;

    switch (schema.type) {
      case 'select':
        return (
          <div key={schema.name} className={`grid grid-cols-3 items-center gap-2 ${fieldWrapperClass}`}>
            <Label className={`text-xs text-muted-foreground flex items-center ${inherited ? 'italic' : ''}`}>
              {schema.label}{labelSuffix}
            </Label>
            <div className="col-span-2 flex items-center gap-1">
              <Select value={displayValue} onValueChange={(val) => handleChange(section, schema.name, val)}>
                <SelectTrigger className={`h-8 text-xs ${inherited ? 'border-dashed' : ''}`}>
                  <SelectValue placeholder={inheritedValue ? `↑ ${inheritedValue}` : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {schema.options?.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clearButton}
            </div>
          </div>
        );

      case 'color': {
        const isValidHex = /^#[0-9A-Fa-f]{6}$/i.test(displayValue);
        const colorInputValue = isValidHex ? displayValue : '#000000';

        return (
          <div key={schema.name} className={`grid grid-cols-3 items-center gap-2 ${fieldWrapperClass}`}>
            <Label className={`text-xs text-muted-foreground flex items-center ${inherited ? 'italic' : ''}`}>
              {schema.label}{labelSuffix}
            </Label>
            <div className="col-span-2 flex items-center gap-1">
              <Input 
                type="color" 
                value={colorInputValue} 
                onChange={(e) => handleChange(section, schema.name, e.target.value)}
                className="h-8 w-10 p-1 cursor-pointer flex-shrink-0"
              />
              <Input 
                type="text" 
                value={displayValue} 
                placeholder={inheritedValue ? `↑ ${inheritedValue}` : ''}
                onChange={(e) => handleChange(section, schema.name, e.target.value)}
                className={`h-8 text-xs flex-1 min-w-0 ${inherited ? 'border-dashed placeholder:text-muted-foreground/60' : ''}`}
              />
              {clearButton}
            </div>
          </div>
        );
      }

      case 'image':
        return (
          <div key={schema.name} className={`space-y-2 ${fieldWrapperClass}`}>
            <Label className={`text-xs text-muted-foreground flex items-center ${inherited ? 'italic' : ''}`}>
              {schema.label}{labelSuffix}
            </Label>
            
            <div className="flex flex-col gap-2">
              {/* Image Preview if valid URL */}
              {displayValue && displayValue.startsWith('http') && (
                <div className="relative w-full h-24 bg-muted rounded-md overflow-hidden border">
                  <img src={displayValue} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Input 
                  type="text" 
                  value={displayValue} 
                  placeholder="https://..."
                  onChange={(e) => handleChange(section, schema.name, e.target.value)}
                  className={`h-8 text-xs flex-1 min-w-0 ${inherited ? 'border-dashed placeholder:text-muted-foreground/60' : ''}`}
                />
                
                {/* Upload Button */}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="icon-sm"
                    className="h-8 w-8 relative overflow-hidden flex-shrink-0"
                    disabled={isUploading || !project?.workspaceId}
                    title="Upload image"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      onChange={(e) => handleFileUpload(e, section, schema.name)}
                      disabled={isUploading || !project?.workspaceId}
                    />
                  </Button>
                </div>
                {clearButton}
              </div>
            </div>
          </div>
        );

      case 'icon-picker' as any: {
        const selectedIcon = displayValue || 'Star';
        return (
          <div key={schema.name} className="space-y-2">
            <Label className="text-xs text-muted-foreground">{schema.label}</Label>
            {/* Current icon display */}
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
              {(() => {
                const Ic = (LucideIcons as any)[selectedIcon] || LucideIcons.Star;
                return <Ic className="h-5 w-5 text-primary" />;
              })()}
              <span className="text-xs font-medium">{selectedIcon}</span>
            </div>
            {/* Icon grid picker */}
            <div className="grid grid-cols-5 gap-1 max-h-48 overflow-y-auto p-1 border rounded-md bg-card">
              {ICON_OPTIONS.map((name) => {
                const Ic = (LucideIcons as any)[name] || LucideIcons.Star;
                const isActive = name === selectedIcon;
                return (
                  <button
                    key={name}
                    title={name}
                    onClick={() => handleChange(section, schema.name, name)}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded text-[9px] leading-tight transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Ic className="h-4 w-4" />
                    <span className="truncate w-full text-center" style={{ fontSize: '8px' }}>{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'page-picker' as any:
        return (
          <div key={schema.name} className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Link2 className="h-3 w-3 text-primary" />
              {schema.label}
            </Label>
            <Select
              value={displayValue}
              onValueChange={(val) => handleChange(section, schema.name, val)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select target page..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="#" className="text-xs">None / Current Page (#)</SelectItem>
                {projectPages?.map((p) => (
                  <SelectItem key={p.id} value={`/published/${p.id}`} className="text-xs">
                    📄 {p.name} ({p.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'text':
      case 'number':
      default:
        return (
          <div key={schema.name} className={`space-y-1 ${fieldWrapperClass}`}>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label className={`text-xs text-muted-foreground flex items-center ${inherited ? 'italic' : ''}`}>
                {schema.label}{labelSuffix}
              </Label>
              <div className="col-span-2 flex items-center gap-1">
                <Input 
                  type={schema.type === 'number' ? 'number' : 'text'}
                  value={displayValue}
                  placeholder={inheritedValue ? `↑ ${inheritedValue}` : ''}
                  onChange={(e) => handleChange(section, schema.name, e.target.value)}
                  className={`h-8 text-xs flex-1 ${inherited ? 'border-dashed placeholder:text-muted-foreground/60' : ''}`}
                />
                {clearButton}
              </div>
            </div>

            {/* Quick Sizing Preset Chips for Width */}
            {schema.name === 'width' && (
              <div className="flex items-center gap-1 pt-1 justify-end">
                {['auto', '100%', '50%', '1200px', '800px'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleChange(section, schema.name, preset)}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                      displayValue === preset
                        ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  const currentAlign = node.style[viewport]?.align || (
    node.style[viewport]?.marginLeft === 'auto' && node.style[viewport]?.marginRight === 'auto' ? 'center' :
    node.style[viewport]?.marginLeft === 'auto' ? 'right' : 'left'
  );

  const handleAlignmentChange = (align: string) => {
    let alignSelf = 'flex-start';
    let marginLeft = '0px';
    let marginRight = 'auto';
    let textAlign = 'left';
    let alignItems = 'flex-start';
    let justifyContent = 'flex-start';

    if (align === 'center') {
      alignSelf = 'center';
      marginLeft = 'auto';
      marginRight = 'auto';
      textAlign = 'center';
      alignItems = 'center';
      justifyContent = 'center';
    } else if (align === 'right') {
      alignSelf = 'flex-end';
      marginLeft = 'auto';
      marginRight = '0px';
      textAlign = 'right';
      alignItems = 'flex-end';
      justifyContent = 'flex-end';
    } else if (align === 'stretch') {
      alignSelf = 'stretch';
      marginLeft = '0px';
      marginRight = '0px';
      textAlign = 'left';
      alignItems = 'stretch';
      justifyContent = 'stretch';
    }

    dispatch(updateNodeProperty({ id: node.id, section: 'style', property: 'align', value: align, viewport }));
    dispatch(updateNodeProperty({ id: node.id, section: 'style', property: 'alignSelf', value: alignSelf, viewport }));
    dispatch(updateNodeProperty({ id: node.id, section: 'style', property: 'marginLeft', value: marginLeft, viewport }));
    dispatch(updateNodeProperty({ id: node.id, section: 'style', property: 'marginRight', value: marginRight, viewport }));
    dispatch(updateNodeProperty({ id: node.id, section: 'style', property: 'textAlign', value: textAlign, viewport }));

    if (node.type === 'container' || node.type === 'root') {
      dispatch(updateNodeProperty({ id: node.id, section: 'style', property: 'alignItems', value: alignItems, viewport }));
      dispatch(updateNodeProperty({ id: node.id, section: 'style', property: 'justifyContent', value: justifyContent, viewport }));
    }
  };

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header with component name + viewport badge */}
      <div className="border-b p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{config.name} Properties</h3>
          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{node.type}</span>
        </div>
        {/* Active viewport indicator */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${vp.bg} ${vp.color}`}>
          <VpIcon className="h-3 w-3" />
          <span>{vp.label}</span>
          <span className="ml-auto text-[10px] font-normal opacity-70">
            {viewport !== 'desktop' ? 'Overrides inherit from Desktop' : 'Base styles'}
          </span>
        </div>
      </div>

      {/* Property groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Universal Horizontal Alignment Control */}
        <div className="space-y-1.5 pb-3 border-b">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alignment</span>
            <span className="text-[10px] font-mono text-muted-foreground capitalize">{currentAlign}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-muted/40 border">
            {[
              { id: 'left', label: 'Left', icon: AlignLeft },
              { id: 'center', label: 'Center', icon: AlignCenter },
              { id: 'right', label: 'Right', icon: AlignRight },
              { id: 'stretch', label: 'Stretch', icon: AlignJustify },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentAlign === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAlignmentChange(item.id)}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                  title={`Align ${item.label}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {config.propertySchemas.map((group) => (
          <div key={group.id} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h4>
            <div className="space-y-3">
              {group.properties.map(prop => renderField(group.id, prop))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete button */}
      {node.type !== 'root' && (
        <div className="border-t p-4">
          <Button 
            variant="destructive" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => dispatch(removeNode(node.id))}
          >
            <Trash2 className="h-4 w-4" />
            Delete {config.name}
          </Button>
        </div>
      )}
    </div>
  );
}
