/**
 * Navigation Section
 * Navigation buttons for strategy selection
 */

import { ChevronRight } from 'lucide-react';
import { Button, Card, CardBody } from '@/shared/ui';

interface NavigationSectionProps {
  onContinue: () => void;
  disabled?: boolean;
}

export const NavigationSection: React.FC<NavigationSectionProps> = ({
  onContinue,
  disabled = false,
}) => {
  return (
    <Card>
      <CardBody>
        <Button
          variant="primary"
          className="w-full"
          onClick={onContinue}
          disabled={disabled}
        >
          <span>Выбрать стратегию</span>
          <ChevronRight className="ml-2 size-4" />
        </Button>
      </CardBody>
    </Card>
  );
};
