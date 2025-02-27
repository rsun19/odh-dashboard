import { ModelCustomizationEndpointType } from '~/concepts/pipelines/content/modelCustomizationForm/modelCustomizationFormSchema/types';
import {
  hyperparameterEvaluationFieldSchema,
  hyperparameterNumericFieldSchema,
  runTypeSchema,
  TeacherJudgeFormData,
  teacherJudgeModel,
} from '~/concepts/pipelines/content/modelCustomizationForm/modelCustomizationFormSchema/validationUtils';
import { InputDefinitionParameterType } from '~/concepts/pipelines/kfTypes';
import { RunTypeFormat } from '~/pages/pipelines/global/modelCustomization/const';

describe('TeacherJudgeSchema', () => {
  it('should validate when it is public without token', () => {
    const field: TeacherJudgeFormData = {
      endpointType: ModelCustomizationEndpointType.PUBLIC,
      apiToken: '',
      modelName: 'test',
      endpoint: 'http://test.com',
    };
    const result = teacherJudgeModel.safeParse(field);
    expect(result.success).toBe(true);
  });
  it('should error when it is private without token', () => {
    const field: TeacherJudgeFormData = {
      endpointType: ModelCustomizationEndpointType.PRIVATE,
      apiToken: '',
      modelName: 'test',
      endpoint: 'http://test.com',
    };
    const result = teacherJudgeModel.safeParse(field);
    expect(result.success).toBe(false);
  });
  it('should validate when it is private with token', () => {
    const field: TeacherJudgeFormData = {
      endpointType: ModelCustomizationEndpointType.PRIVATE,
      apiToken: 'test',
      modelName: 'test',
      endpoint: 'http://test.com',
    };
    const result = teacherJudgeModel.safeParse(field);
    expect(result.success).toBe(true);
  });
  it('should error when the endpoint is not a uri', () => {
    const field: TeacherJudgeFormData = {
      endpointType: ModelCustomizationEndpointType.PRIVATE,
      apiToken: 'test',
      modelName: 'test',
      endpoint: 'not a uri',
    };
    const result = teacherJudgeModel.safeParse(field);
    expect(result.success).toBe(false);
  });
});

describe('hyperparameterFieldSchema', () => {
  it('should validate with correct parameters', () => {
    const hyperparameter = {
      defaultValue: 30,
      description: 'SDG parameter. The total number of instructions to be generated.',
      isOptional: false,
      parameterType: InputDefinitionParameterType.INTEGER,
    };
    const result = hyperparameterNumericFieldSchema.safeParse(hyperparameter);
    expect(result.success).toBe(true);
  });

  it('should not validate when default value is a decimal when it should have been an integer', () => {
    const hyperparameter = {
      defaultValue: 30.78,
      description: 'SDG parameter. The total number of instructions to be generated.',
      isOptional: false,
      parameterType: InputDefinitionParameterType.INTEGER,
    };
    const result = hyperparameterNumericFieldSchema.safeParse(hyperparameter);
    expect(result.success).toBe(false);
  });

  it('should not validate when default value is negative', () => {
    const hyperparameter = {
      defaultValue: -0.0012345678,
      description: 'SDG parameter. The total number of instructions to be generated.',
      isOptional: false,
      parameterType: InputDefinitionParameterType.INTEGER,
    };
    const result = hyperparameterNumericFieldSchema.safeParse(hyperparameter);
    expect(result.success).toBe(false);
  });

  it('should validate if evaluation field is auto', () => {
    const hyperparameter = {
      defaultValue: 'auto',
      description:
        "Final model evaluation parameter for MMLU. Batch size for evaluation. Valid values are a positive integer or 'auto' to select the largest batch size that will fit in memory.",
      isOptional: false,
      parameterType: InputDefinitionParameterType.STRING,
    };
    const result = hyperparameterEvaluationFieldSchema.safeParse(hyperparameter);
    expect(result.success).toBe(true);
  });

  it('should validate if evaluation field is a valid number', () => {
    const hyperparameter = {
      defaultValue: '54',
      description:
        "Final model evaluation parameter for MMLU. Batch size for evaluation. Valid values are a positive integer or 'auto' to select the largest batch size that will fit in memory.",
      isOptional: false,
      parameterType: InputDefinitionParameterType.STRING,
    };
    const result = hyperparameterEvaluationFieldSchema.safeParse(hyperparameter);
    expect(result.success).toBe(true);
  });

  it('should invalidate if evaluation field is not a valid number', () => {
    const hyperparameter = {
      defaultValue: '5.4',
      description:
        "Final model evaluation parameter for MMLU. Batch size for evaluation. Valid values are a positive integer or 'auto' to select the largest batch size that will fit in memory.",
      isOptional: false,
      parameterType: InputDefinitionParameterType.STRING,
    };
    const result = hyperparameterEvaluationFieldSchema.safeParse(hyperparameter);
    expect(result.success).toBe(false);
  });

  it('should validate if run type is full', () => {
    const runType = RunTypeFormat.FULL;
    const result = runTypeSchema.safeParse(runType);
    expect(result.success).toBe(true);
  });

  it('should validate if run type if simple', () => {
    const runType = RunTypeFormat.SIMPLE;
    const result = runTypeSchema.safeParse(runType);
    expect(result.success).toBe(true);
  });
});
