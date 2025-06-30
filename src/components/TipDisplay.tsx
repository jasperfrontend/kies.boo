import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTipsSystem } from '@/hooks/useTipsSystem';

interface TipDisplayProps {
  className?: string;
  showControls?: boolean;
  variant?: 'default' | 'compact';
}

export const TipDisplay: React.FC<TipDisplayProps> = ({ 
  className = "", 
  showControls = true,
  variant = 'default'
}) => {
  const { 
    showTips, 
    currentTip, 
    currentTipIndex, 
    totalTips, 
    hasMultipleTips,
    nextTip, 
    previousTip,
    markTipAsShown
  } = useTipsSystem();

  if (!showTips || !currentTip) {
    return null;
  }

  const handleDismissTip = () => {
    markTipAsShown(currentTip.id);
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md ${className}`}>
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300 flex-1">
          {currentTip.text}
        </p>
        {showControls && (
          <div className="flex items-center gap-1">
            {hasMultipleTips && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={previousTip}
                      className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous tip</TooltipContent>
                </Tooltip>
                
                <span className="text-xs text-blue-600 dark:text-blue-400 px-1">
                  {currentTipIndex + 1}/{totalTips}
                </span>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextTip}
                      className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next tip</TooltipContent>
                </Tooltip>
              </>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissTip}
                  className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Dismiss tip</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${className}`}>
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-medium">Pro tip:</span> {currentTip.text}
        </p>
        {hasMultipleTips && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Tip {currentTipIndex + 1} of {totalTips} for this page
          </p>
        )}
      </div>
      
      {showControls && (
        <div className="flex items-center gap-1">
          {hasMultipleTips && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousTip}
                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous tip</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextTip}
                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next tip</TooltipContent>
              </Tooltip>
            </>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissTip}
                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dismiss tip</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};