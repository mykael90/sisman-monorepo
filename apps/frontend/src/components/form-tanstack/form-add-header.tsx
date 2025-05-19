import { FC } from 'react';

function FormAddHeader({
  Icon,
  title,
  subtitle,
  description
}: {
  Icon?: FC<{ className?: string }>;
  title: string;
  subtitle?: string;
  description?: string;
}) {
  interface IconHeaderProps {
    Icon: FC<{ className?: string }>; // Define um componente que aceita 'className'
  }

  const IconHeader: FC<IconHeaderProps> = ({ Icon }) => {
    return <Icon className='text-sisman-green h-5 w-5' />;
  };

  return (
    <div className='border-b'>
      <div className='px-6 pt-6 pb-5'>
        {' '}
        {/* Consistent horizontal padding, adjusted vertical for balance */}
        <div className='flex items-center'>
          <div className='text-sisman-green flex items-center'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
              {Icon && <IconHeader Icon={Icon} />}
            </div>
            <h2 className='ml-3 text-xl font-bold'>{title}</h2>{' '}
            {/* Increased ml slightly for better spacing from icon bg */}
          </div>
        </div>
        <p className='mt-2 text-sm text-gray-600'>{subtitle}</p>
        <p className='mt-2 text-sm text-gray-400'>{description}</p>
      </div>
      <div className='bg-sisman-green ml-6 h-1 w-1/10'></div>{' '}
      {/* Accent underline, aligned with px-6 content */}
    </div>
  );
}

export default FormAddHeader;
