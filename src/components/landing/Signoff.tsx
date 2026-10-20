import { MlMark } from '@/components/brand/MlMark';
import { t } from '@/i18n/ml';
import { PaintOnView } from './PaintOnView';

/**
 * The last word on every page: the sign-off that ends the founder's videos, painted large in
 * Malayalam (drawn from its pre-rendered image, so the page never downloads the Malayalam font).
 * Nothing else: no label, no explanation.
 */
export function Signoff() {
  const signoff = t('footerSignoff');
  if (!signoff.ml) return null;
  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-10 md:px-10">
      <div data-ml-signoff="" className="pt-8 md:pt-10">
        <PaintOnView className="-my-5 md:-my-10">
          <MlMark mlKey="footerSignoff" variant="wall" className="text-[min(26vw,15rem)] text-rosso" />
        </PaintOnView>
      </div>
    </div>
  );
}
