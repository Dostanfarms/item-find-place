
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateBanner, useUpdateBanner, Banner } from '@/hooks/useBanners';

const bannerSchema = z.object({
  name: z.string().min(1, 'Banner name is required'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  redirect_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_active: z.boolean(),
  display_order: z.number().min(0, 'Display order must be 0 or greater'),
}).refine(data => data.image_url || data.video_url, {
  message: "Either image URL or video URL must be provided",
  path: ["image_url"],
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  banner?: Banner;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BannerForm: React.FC<BannerFormProps> = ({ banner, onSuccess, onCancel }) => {
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      name: banner?.name || '',
      image_url: banner?.image_url || '',
      video_url: banner?.video_url || '',
      redirect_url: banner?.redirect_url || '',
      is_active: banner?.is_active ?? true,
      display_order: banner?.display_order || 0,
    },
  });

  const onSubmit = async (data: BannerFormData) => {
    try {
      const bannerData = {
        name: data.name,
        image_url: data.image_url || undefined,
        video_url: data.video_url || undefined,
        redirect_url: data.redirect_url || undefined,
        is_active: data.is_active,
        display_order: data.display_order,
      };

      if (banner) {
        await updateBanner.mutateAsync({ id: banner.id, ...bannerData });
      } else {
        await createBanner.mutateAsync(bannerData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save banner:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter banner name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/video.mp4" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="redirect_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Redirect URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/page" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="0" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable this banner to be displayed
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={createBanner.isPending || updateBanner.isPending}
          >
            {createBanner.isPending || updateBanner.isPending ? 'Saving...' : banner ? 'Update Banner' : 'Create Banner'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default BannerForm;
