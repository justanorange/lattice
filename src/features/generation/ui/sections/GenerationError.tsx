/**
 * Generation Error Section
 * Error display during generation
 */

import { Card, CardBody } from '@/shared/ui';

interface GenerationErrorProps {
  error: string;
}

export const GenerationError: React.FC<GenerationErrorProps> = ({ error }) => {
  return (
    <Card className="mb-6 border-red-200 dark:border-red-800">
      <CardBody>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </CardBody>
    </Card>
  );
};
