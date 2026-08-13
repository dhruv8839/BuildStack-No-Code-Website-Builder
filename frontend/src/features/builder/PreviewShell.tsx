import { useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetBuilderStateQuery } from '../projects/pagesApiSlice';
import { loadBuilderState, setViewport } from './state/builderSlice';
import { PreviewNode } from './renderer/PreviewNode';
import type { RootState } from '../../app/store';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PreviewShell() {
  const [searchParams] = useSearchParams();
  const params = useParams<{ pageId?: string }>();
  const pageId = params.pageId || searchParams.get('pageId');
  const dispatch = useDispatch();

  const rootNodeId = useSelector((state: RootState) => state.builder.rootNodeId);
  const theme = useSelector((state: RootState) => state.builder.theme);

  // Fetch saved builder state
  const { data: pageBuilderState, isLoading, error } = useGetBuilderStateQuery(pageId!, {
    skip: !pageId,
  });

  useEffect(() => {
    if (pageBuilderState) {
      dispatch(loadBuilderState(pageBuilderState));
    }
  }, [pageBuilderState, dispatch]);

  // Handle responsive viewport based on window size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        dispatch(setViewport('mobile'));
      } else if (width < 1024) {
        dispatch(setViewport('tablet'));
      } else {
        dispatch(setViewport('desktop'));
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // Inject Google Font into document head dynamically
  useEffect(() => {
    if (!theme?.fontFamily) return;
    const fontName = theme.fontFamily;
    const fontId = `gfont-${fontName.replace(/\s+/g, '-')}`;

    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`;
      document.head.appendChild(link);
    }
  }, [theme?.fontFamily]);

  // Dynamic SEO Meta Tags injection
  const rootNode = useSelector((state: RootState) => rootNodeId ? state.builder.nodes[rootNodeId] : null);
  useEffect(() => {
    const seo = rootNode?.settings?.seo || {};
    const title = seo.title || 'BuildStack Published Page';
    const description = seo.description || '';
    const keywords = seo.keywords || '';

    document.title = title;

    let descMeta = document.querySelector('meta[name="description"]');
    if (description) {
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', description);
    }

    let kwMeta = document.querySelector('meta[name="keywords"]');
    if (keywords) {
      if (!kwMeta) {
        kwMeta = document.createElement('meta');
        kwMeta.setAttribute('name', 'keywords');
        document.head.appendChild(kwMeta);
      }
      kwMeta.setAttribute('content', keywords);
    }
  }, [rootNode?.settings?.seo]);

  if (!pageId) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-destructive">
        <AlertCircle className="h-5 w-5 mr-2" />
        No page specified for preview.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-destructive">
        <AlertCircle className="h-5 w-5 mr-2" />
        Failed to load page for preview.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      {rootNodeId ? (
        <PreviewNode nodeId={rootNodeId} />
      ) : (
        <div className="flex h-screen w-screen items-center justify-center text-muted-foreground">
          Page is empty.
        </div>
      )}
    </div>
  );
}
