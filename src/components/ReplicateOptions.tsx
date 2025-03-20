
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const replicateOptionsSchema = z.object({
  lora_scale: z.coerce.number().min(-1).max(3),
  guidance: z.coerce.number().min(0).max(10),
  output_quality: z.coerce.number().int().min(1).max(100),
  prompt_strength: z.coerce.number().min(0).max(1),
  num_inference_steps: z.coerce.number().int().min(1).max(50),
  aspect_ratio: z.string(),
  output_format: z.string(),
  disable_safety_checker: z.boolean(),
  go_fast: z.boolean(),
  megapixels: z.string(),
  lora_weights: z.string().optional(),
});

export type ReplicateOptionsValues = z.infer<typeof replicateOptionsSchema>;

interface ReplicateOptionsProps {
  defaultValues?: Partial<ReplicateOptionsValues>;
  onChange: (values: ReplicateOptionsValues) => void;
  modelHasDefaultLora?: boolean;
  modelDefaultLora?: string;
}

const ReplicateOptions = ({
  defaultValues,
  onChange,
  modelHasDefaultLora = false,
  modelDefaultLora = '',
}: ReplicateOptionsProps) => {
  const form = useForm<ReplicateOptionsValues>({
    resolver: zodResolver(replicateOptionsSchema),
    defaultValues: {
      lora_scale: defaultValues?.lora_scale || 1,
      guidance: defaultValues?.guidance || 3,
      output_quality: defaultValues?.output_quality || 80,
      prompt_strength: defaultValues?.prompt_strength || 0.8,
      num_inference_steps: defaultValues?.num_inference_steps || 28,
      aspect_ratio: defaultValues?.aspect_ratio || '1:1',
      output_format: defaultValues?.output_format || 'webp',
      disable_safety_checker: defaultValues?.disable_safety_checker || false,
      go_fast: defaultValues?.go_fast !== undefined ? defaultValues.go_fast : true,
      megapixels: defaultValues?.megapixels || "1",
      lora_weights: defaultValues?.lora_weights || modelDefaultLora,
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onChange(value as ReplicateOptionsValues);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  const aspectRatios = [
    { label: 'Square (1:1)', value: '1:1' },
    { label: 'Portrait (2:3)', value: '2:3' },
    { label: 'Landscape (3:2)', value: '3:2' },
    { label: 'Widescreen (16:9)', value: '16:9' },
    { label: 'Ultrawide (21:9)', value: '21:9' },
  ];

  const outputFormats = [
    { label: 'WebP', value: 'webp' },
    { label: 'PNG', value: 'png' },
    { label: 'JPEG', value: 'jpeg' },
  ];

  const megapixelsOptions = [
    { label: '1 MP', value: '1' },
    { label: '2 MP', value: '2' },
    { label: '4 MP', value: '4' },
    { label: '8 MP', value: '8' },
  ];

  return (
    <Form {...form}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced-options">
          <AccordionTrigger>Advanced Replicate Options</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="aspect_ratio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect Ratio</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The aspect ratio of the generated image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="output_format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Format</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outputFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The file format of the generated image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="megapixels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Megapixels</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select megapixels" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {megapixelsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Higher values produce larger, more detailed images but take longer to generate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!modelHasDefaultLora && (
              <FormField
                control={form.control}
                name="lora_weights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LoRA Weights</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="fofr/flux-80s-cyberpunk" />
                    </FormControl>
                    <FormDescription>
                      LoRA weights from Replicate, HuggingFace, or CivitAI
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="lora_scale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LoRA Strength: {field.value.toFixed(2)}</FormLabel>
                  <FormControl>
                    <Slider
                      min={-1}
                      max={3}
                      step={0.01}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Adjust the strength of the LoRA model (sane values are between 0 and 1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guidance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guidance Scale: {field.value.toFixed(1)}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={10}
                      step={0.1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    How closely to follow the prompt (higher = more faithful)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt_strength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Strength: {field.value.toFixed(2)}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Denoising strength (for img2img mode if used)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="num_inference_steps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inference Steps: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={50}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of diffusion steps (higher = more detail but slower)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="output_quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Quality: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Quality of the output image (not relevant for PNG)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 grid-cols-2">
              <FormField
                control={form.control}
                name="go_fast"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Optimize for Speed</FormLabel>
                      <FormDescription>
                        Run faster with FP8 quantized model
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="disable_safety_checker"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Disable Safety Checker</FormLabel>
                      <FormDescription>
                        Turn off the safety filter (use responsibly)
                      </FormDescription>
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Form>
  );
};

export default ReplicateOptions;
