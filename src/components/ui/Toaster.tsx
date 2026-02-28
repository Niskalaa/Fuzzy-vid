
import { Toaster as HotToaster } from 'react-hot-toast';

const Toaster = () => {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--glass-03)',
          color: 'var(--text-primary)',
          border: '1px solid var(--glass-border-02)',
        },
      }}
    />
  );
};

export default Toaster;
