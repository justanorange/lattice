/**
 * Generation Loading Section
 * Loading spinner during generation
 */

import { Card, CardBody, Spinner } from '@/shared/ui';

export const GenerationLoading: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardBody className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">
            Генерация билетов...
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
