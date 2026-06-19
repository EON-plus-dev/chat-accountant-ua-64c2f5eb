import { useState, useEffect } from 'react';
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGovBranchRating, useGovBranchReviews, useGovServices, useSubmitReview } from '@/portal/hooks/useGovBranches';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

function StarRating({ rating, onRate, interactive = false, size = 'md' }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md';
}) {
  const [hover, setHover] = useState(0);
  const s = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${s} ${interactive ? 'cursor-pointer' : ''} ${
            i <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
          }`}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );
}

interface Props {
  branchId: string;
  agencySlug: string;
}

export function GovReviewSection({ branchId, agencySlug }: Props) {
  const { data: ratingData } = useGovBranchRating(branchId);
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const { data: reviewsData } = useGovBranchReviews(branchId, page, pageSize);
  const { data: services = [] } = useGovServices(agencySlug);
  const submitReview = useSubmitReview();

  const reviews = reviewsData?.reviews ?? [];
  const totalCount = reviewsData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const [userId, setUserId] = useState<string | null>(null);
  const [formRating, setFormRating] = useState(0);
  const [formText, setFormText] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formServiceId, setFormServiceId] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const publishedReviews = reviews.filter((r) => r.status === 'published');

  const handleSubmit = () => {
    if (!userId) return;
    if (formRating < 1) {
      toast.error('Оберіть рейтинг');
      return;
    }
    submitReview.mutate(
      {
        branch_id: branchId,
        user_id: userId,
        rating: formRating,
        text: formText.trim() || null,
        visit_date: formDate || null,
        service_id: formServiceId || null,
      },
      {
        onSuccess: () => {
          toast.success('Дякуємо! Ваш відгук буде опубліковано після модерації');
          setFormRating(0);
          setFormText('');
          setFormDate('');
          setFormServiceId('');
          setPage(0);
        },
        onError: () => toast.error('Помилка при надсиланні відгуку'),
      }
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Відгуки</h2>

      {/* Average rating */}
      {ratingData && ratingData.count > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-foreground">{ratingData.avg.toFixed(1)}</span>
          <div>
            <StarRating rating={Math.round(ratingData.avg)} />
            <p className="text-xs text-muted-foreground mt-0.5">
              {ratingData.count} {ratingData.count === 1 ? 'відгук' : ratingData.count < 5 ? 'відгуки' : 'відгуків'}
            </p>
          </div>
        </div>
      )}

      {/* Review list */}
      {publishedReviews.length > 0 ? (
        <div className="space-y-3">
          {publishedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.visit_date && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(review.visit_date), 'd MMM yyyy', { locale: uk })}
                    </span>
                  )}
                </div>
                {review.text && <p className="text-sm text-foreground">{review.text}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Поки немає відгуків. Будьте першим!</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Попередня
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} з {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Наступна
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      <Separator />

      {/* Review form */}
      {userId ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Залишити відгук</h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Рейтинг *</Label>
              <StarRating rating={formRating} onRate={setFormRating} interactive />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Коментар</Label>
              <Textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Опишіть ваш досвід..."
                className="min-h-[80px]"
                maxLength={1000}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Дата візиту</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Послуга</Label>
                <Select value={formServiceId} onValueChange={setFormServiceId}>
                  <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={submitReview.isPending} size="sm">
              {submitReview.isPending ? 'Надсилання...' : 'Надіслати відгук'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <a href="/login" className="text-primary hover:underline font-medium">Увійдіть</a>, щоб залишити відгук
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
