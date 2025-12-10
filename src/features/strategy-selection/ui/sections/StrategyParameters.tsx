/**
 * Strategy Parameters Section
 * Input fields for strategy parameters
 */

import { Card, CardHeader, CardBody, Grid, Input, Slider } from '@/shared/ui';
import type { Strategy, StrategyParameter } from '@/entities/strategies/types';

interface StrategyParametersProps {
  strategy: Strategy;
  params: Record<string, unknown>;
  onParamChange: (key: string, value: unknown) => void;
}

export const StrategyParameters: React.FC<StrategyParametersProps> = ({
  strategy,
  params,
  onParamChange,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Параметры
        </h2>
      </CardHeader>
      <CardBody>
        <Grid cols={1} gap="md">
          {strategy.parameters.map((param) => (
            <ParameterInput
              key={param.key}
              param={param}
              value={params[param.key]}
              onChange={(value) => onParamChange(param.key, value)}
            />
          ))}
        </Grid>
      </CardBody>
    </Card>
  );
};

interface ParameterInputProps {
  param: StrategyParameter;
  value: unknown;
  onChange: (value: unknown) => void;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  param,
  value,
  onChange,
}) => {
  if (param.type === 'number') {
    return (
      <Input
        type="text"
        label={param.label}
        value={value?.toString() || param.defaultValue?.toString() || ''}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min={param.min}
        max={param.max}
        step={param.step || 1}
        helper={param.description}
      />
    );
  }

  if (param.type === 'range') {
    return (
      <Slider
        label={param.label}
        value={(value as number) || (param.defaultValue as number) || 0}
        onValueChange={(val) => onChange(val[0])}
        min={param.min || 0}
        max={param.max || 100}
        step={param.step || 1}
        helper={param.description}
      />
    );
  }

  if (param.type === 'text') {
    return (
      <Input
        type="text"
        label={param.label}
        value={(value as string) || (param.defaultValue as string) || ''}
        onChange={(e) => {
          const inputValue = e.target.value;
          // Allow only digits, commas, spaces
          if (/^[0-9,\s]*$/.test(inputValue) || inputValue === '') {
            onChange(inputValue);
          }
        }}
        placeholder={param.defaultValue?.toString() || ''}
        helper={param.description}
      />
    );
  }

  return null;
};
