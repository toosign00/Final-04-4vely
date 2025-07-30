interface PasswordStrengthIndicatorProps {
  password: string;
  strength: {
    score: number;
    text: string;
    color: string;
  };
}

export default function PasswordStrengthIndicator({ password, strength }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const getStrengthBarColor = (index: number) => {
    if (index < strength.score) {
      switch (true) {
        case strength.score <= 2:
          return 'bg-gradient-to-r from-red-400 to-red-500';
        case strength.score === 3:
          return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
        case strength.score === 4:
          return 'bg-gradient-to-r from-blue-400 to-blue-500';
        case strength.score === 5:
          return 'bg-gradient-to-r from-green-400 to-green-500';
        default:
          return 'bg-gray-200';
      }
    }
    return 'bg-gray-200';
  };

  const getStrengthIcon = () => {
    switch (true) {
      case strength.score <= 2:
        return (
          <svg className='w-4 h-4 text-red-500' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
          </svg>
        );
      case strength.score === 3:
        return (
          <svg className='w-4 h-4 text-yellow-500' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
          </svg>
        );
      case strength.score >= 4:
        return (
          <svg className='w-4 h-4 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-700">비밀번호 강도</span>
        <div className="flex items-center gap-1">
          {getStrengthIcon()}
          {strength.text && (
            <span className={`text-xs font-medium ${strength.color}`}>
              {strength.text}
            </span>
          )}
        </div>
      </div>
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${getStrengthBarColor(index)}`}
          />
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-1">
          <div className={`flex items-center gap-1 ${/[a-zA-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${/[a-zA-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
            영문 포함
          </div>
          <div className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
            숫자 포함
          </div>
          <div className={`flex items-center gap-1 ${/[@$!%*?&]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${/[@$!%*?&]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
            특수문자 포함
          </div>
          <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
            8자 이상
          </div>
        </div>
      </div>
    </div>
  );
}