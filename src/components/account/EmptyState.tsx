
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon: string;
  buttonLabel?: string;
  buttonHref?: string;
  buttonAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  buttonLabel,
  buttonHref,
  buttonAction,
}) => {
  return (
    <div className="text-center py-12 px-4 border border-dashed rounded-lg">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {buttonLabel && (buttonHref || buttonAction) && (
        buttonHref ? (
          <Button asChild>
            <Link to={buttonHref}>{buttonLabel}</Link>
          </Button>
        ) : (
          <Button onClick={buttonAction}>{buttonLabel}</Button>
        )
      )}
    </div>
  );
};

export default EmptyState;
