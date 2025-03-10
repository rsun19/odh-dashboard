import { z } from 'zod';
import { hardwareProfileValidationSchema } from '~/concepts/hardwareProfiles/validationUtils';
import { isCpuLimitLarger, isMemoryLimitLarger } from '~/utilities/valueUnits';
import { AcceleratorProfileFormData } from '~/utilities/useAcceleratorProfileFormState';
import { isEnumMember } from '~/utilities/utils';
import { RunTypeFormat } from '~/pages/pipelines/global/modelCustomization/const';
import { FineTuneTaxonomyType, ModelCustomizationEndpointType } from './types';

export const uriFieldSchemaBase = (
  isOptional: boolean,
): z.ZodEffects<z.ZodString, string, string> =>
  z.string().refine(
    (value) => {
      if (!value) {
        return !!isOptional;
      }
      try {
        return !!new URL(value);
      } catch (e) {
        return false;
      }
    },
    { message: 'Invalid URI' },
  );

export const baseModelSchema = z.object({
  sdgBaseModel: uriFieldSchemaBase(true),
});

export const outputModelSchema = z.object({
  outputModelName: z.string().trim().min(1, 'Model name is required'),
  outputModelRegistryApiUrl: z.string().trim().min(1, 'Model registry API URL is required'),
  // TODO more output model fields
});

const teacherJudgeBaseSchema = z.object({
  endpoint: uriFieldSchemaBase(false),
  modelName: z.string().trim().min(1, 'Model name is required'),
});
const teacherJudgePublicSchema = teacherJudgeBaseSchema.extend({
  endpointType: z.literal(ModelCustomizationEndpointType.PUBLIC),
  apiToken: z.string(),
});
const teacherJudgePrivateSchema = teacherJudgeBaseSchema.extend({
  endpointType: z.literal(ModelCustomizationEndpointType.PRIVATE),
  apiToken: z.string().trim().min(1, 'Token is required'),
});

export const teacherJudgeModel = z.discriminatedUnion('endpointType', [
  teacherJudgePrivateSchema,
  teacherJudgePublicSchema,
]);

export const runTypeSchema = z.string().refine(
  (value) => {
    if (!isEnumMember(value, RunTypeFormat)) {
      return false;
    }
    return true;
  },
  { message: 'Invalid Run Type' },
);

export const fineTunedModelDetailsSchema = z.object({
  registry: z.string(),
  versionName: z.string().min(1, 'Version name is required'),
  modelStorageLocation: z.string(),
});

export const fineTuneTaxonomySchema = z.object({
  url: z
    .string()
    .url()
    .refine((url) => url.endsWith('.git'), {
      message: 'Invalid Git URL',
    }),
  secret: z.discriminatedUnion('type', [
    z.object({
      type: z.literal(FineTuneTaxonomyType.SSH_KEY),
      sshKey: z.string().trim().min(1, 'SSH Key is required'),
      username: z.string().optional(),
      token: z.string().optional(),
    }),
    z.object({
      type: z.literal(FineTuneTaxonomyType.USERNAME_TOKEN),
      username: z.string().trim().min(1, 'Username is required'),
      token: z.string().trim().min(1, 'Token is required'),
      sshKey: z.string().optional(),
    }),
  ]),
});

const hardwareSchema = z.object({
  podSpecOptions: z.object({
    cpuCount: z
      .union([z.string(), z.number()])
      .refine((val) => isCpuLimitLarger(0, val), { message: 'CPU count must be greater than 0' }),
    memoryCount: z.string().refine((val) => isMemoryLimitLarger('0', val), {
      message: 'Memory count must be greater than 0',
    }),
    gpuCount: z.number().refine((val) => val > 0, { message: 'GPU count must be greater than 0' }),
    gpuIdentifier: z.string().trim().min(1, 'GPU identifier cannot be empty'),
    tolerations: z.array(z.any()).optional(),
    nodeSelector: z.record(z.any()).optional(),
  }),
  hardwareProfileConfig: hardwareProfileValidationSchema.optional(),
  acceleratorProfileConfig: z.custom<AcceleratorProfileFormData>().optional(),
});

export type FineTuneTaxonomyFormData = z.infer<typeof fineTuneTaxonomySchema>;

export const modelCustomizationFormSchema = z.object({
  projectName: z.object({ value: z.string().min(1, { message: 'Project is required' }) }),
  taxonomy: fineTuneTaxonomySchema,
  runType: z.object({ value: runTypeSchema }),
  hyperparameters: z.record(z.string(), z.any()),
  baseModel: baseModelSchema,
  outputModel: outputModelSchema,
  teacher: teacherJudgeModel,
  judge: teacherJudgeModel,
  trainingNode: z.number().refine((val) => val > 0, { message: 'Number must be greater than 0' }),
  storageClass: z.string().trim().min(1, { message: 'storage class is required' }),
  hardware: hardwareSchema,
});

export type ModelCustomizationFormData = z.infer<typeof modelCustomizationFormSchema>;
export type BaseModelFormData = z.infer<typeof baseModelSchema>;
export type OutputModelFormData = z.infer<typeof outputModelSchema>;
export type TeacherJudgeFormData = z.infer<typeof teacherJudgeModel>;
export type HardwareFormData = z.infer<typeof hardwareSchema>;
