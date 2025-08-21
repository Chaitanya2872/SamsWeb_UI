import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { useBackNavigation } from '../../hooks/useNavigation';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label = 'Back',
  className = ''
}) => {
  const goBack = useBackNavigation();
  const { navigateTo } = useNavigation();

  const handleClick = () => {
    if (to) {
      navigateTo(to);
    } else {
      goBack();
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
      className={className}
    >
      {label}
    </Button>
  );
};
