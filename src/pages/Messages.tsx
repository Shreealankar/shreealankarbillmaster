import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare } from 'lucide-react';

const Messages = () => {
  const { t } = useLanguage();
  
  return (
    <div className="p-8 text-center">
      <div className="max-w-md mx-auto">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">{t('messages')}</h1>
        <p className="text-muted-foreground">{t('messages')} page coming soon...</p>
      </div>
    </div>
  );
};

export default Messages;