import { supabase } from '@/integrations/supabase/client'

export interface SubscriptionData {
  email: string
  name?: string
  audienceType?: string
  topics?: string[]
  source: 'lead_magnet' | 'alert_subscription' | 'article_alert' | 'sidebar_mini' | 'unified_cta'
  articleSlug?: string
}

export async function createSubscription(data: SubscriptionData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('email_subscriptions')
      .insert({
        email: data.email.toLowerCase().trim(),
        name: data.name?.trim() || null,
        audience_type: data.audienceType || null,
        topics: data.topics || [],
        source: data.source,
        article_slug: data.articleSlug || null,
      })

    if (error) {
      console.error('Subscription error:', error)
      return { success: false, error: 'Помилка збереження. Спробуйте ще раз.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Subscription exception:', err)
    return { success: false, error: 'Щось пішло не так. Спробуйте ще раз.' }
  }
}
