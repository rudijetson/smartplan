import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { getLLMSuggestions } from '../../services/llmService';
import { useToast } from './Toast';

export const SuggestionsButton = ({ 
  onSuggestionsReceived, 
  calculatorType,
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [businessType, setBusinessType] = useState('restaurant');
  const [showSelect, setShowSelect] = useState(false);
  const { addToast } = useToast();

  const handleGetSuggestions = async () => {
    setLoading(true);
    try {
      const suggestions = await getLLMSuggestions(businessType, calculatorType);
      onSuggestionsReceived(suggestions);
      addToast('Demo suggestions loaded successfully!');
      setShowSelect(false);
    } catch (error) {
      addToast('Failed to get suggestions', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showSelect && (
        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg min-w-[180px]">
            <SelectItem value="restaurant" className="hover:bg-gray-100">Restaurant</SelectItem>
            <SelectItem value="retail" className="hover:bg-gray-100">Retail Store</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Button 
        onClick={showSelect ? handleGetSuggestions : () => setShowSelect(true)} 
        disabled={loading}
        className={className}
        variant="outline"
        size="sm"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {loading ? 'Getting Suggestions...' : showSelect ? 'Load Suggestions' : 'Get Demo Suggestions'}
      </Button>
    </div>
  );
}; 