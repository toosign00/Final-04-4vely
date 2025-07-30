'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Step1Data } from '@/types/auth.types';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import AgreementCheckbox from '../AgreementCheckbox';
import { ValidationError } from '../ErrorDisplay';

interface Step1TermsAgreementProps {
  agreeTerms: boolean;
  agreePrivacy: boolean;
  onAgreeTermsChange: (checked: boolean) => void;
  onAgreePrivacyChange: (checked: boolean) => void;
  onAgreeAll: (checked: boolean) => void;
  onNext: (data: Step1Data) => void;
  errors?: {
    agreeTerms?: string;
    agreePrivacy?: string;
  };
}

const TERMS_CONTENT = `
**제1조 (목적)**
이 약관은 Green Mate(이하 "회사")가 운영하는 반려 식물 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

**제2조 (정의)**
1. "서비스"란 회사가 제공하는 반려 식물 관리, 식물 쇼핑몰, 커뮤니티 등의 모든 서비스를 의미합니다.
2. "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
3. "회원"이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며, 서비스를 계속적으로 이용할 수 있는 자를 말합니다.

**제3조 (약관의 효력 및 변경)**
1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력을 발생합니다.
2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는 통지함으로써 효력을 발생합니다.

**제4조 (서비스의 제공 및 변경)**
1. 회사는 다음과 같은 업무를 수행합니다:
   - 반려 식물 관리 정보 제공
   - 식물 관련 상품 판매
   - 커뮤니티 서비스 운영
   - 기타 회사가 정하는 업무

**제5조 (서비스 이용료)**
서비스 이용은 무료를 원칙으로 하며, 일부 유료 서비스의 경우 별도로 정한 요금을 지불해야 합니다.
`;

const PRIVACY_CONTENT = `
**개인정보 처리방침**

Green Mate(이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.

**1. 개인정보의 처리목적**
회사는 다음의 목적을 위하여 개인정보를 처리합니다:
- 회원 가입의사 확인, 회원제 서비스 제공
- 본인식별·인증, 회원자격 유지·관리
- 서비스 제공을 위한 연락·고지
- 법령 및 Green Mate 이용약관을 위반하는 회원에 대한 이용 제한 조치

**2. 개인정보의 처리 및 보유기간**
회사는 정보주체로부터 개인정보를 수집할 때 동의받은 개인정보 보유·이용기간 또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

**3. 개인정보의 제3자 제공**
회사는 정보주체의 개인정보를 개인정보의 처리목적에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.

**4. 개인정보처리 위탁**
회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
- 위탁받는 자: Amazon Web Services
- 위탁하는 업무의 내용: 클라우드 서비스 제공

**5. 정보주체의 권리·의무 및 행사방법**
이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
- 개인정보 처리정지 요구권
- 개인정보 열람요구권
- 개인정보 정정·삭제요구권
- 개인정보 처리정지 요구권
`;

export default function Step1TermsAgreement({ agreeTerms, agreePrivacy, onAgreeTermsChange, onAgreePrivacyChange, onAgreeAll, onNext, errors }: Step1TermsAgreementProps) {
  const [openDialog, setOpenDialog] = useState<'terms' | 'privacy' | null>(null);

  const isAllAgreed = agreeTerms && agreePrivacy;
  const hasErrors = errors?.agreeTerms || errors?.agreePrivacy;

  const handleNext = () => {
    if (isAllAgreed) {
      onNext({ agreeTerms, agreePrivacy });
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2 text-center'>
        <h2 className='t-h2 text-secondary'>서비스 이용을 위한 약관에 동의해주세요</h2>
        <p className='text-muted text-sm'>안전하고 편리한 서비스 이용을 위해 약관 동의가 필요합니다.</p>
      </div>

      {/* Agreement Section */}
      <div className='space-y-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm'>
        {/* Terms Agreement */}
        <AgreementCheckbox className='px-3' id='agreeTerms' label='이용약관에 동의합니다' checked={agreeTerms} onChange={onAgreeTermsChange} onViewDetails={() => setOpenDialog('terms')} error={errors?.agreeTerms} required />

        {/* Privacy Agreement */}
        <AgreementCheckbox className='px-3' id='agreePrivacy' label='개인정보 처리방침에 동의합니다' checked={agreePrivacy} onChange={onAgreePrivacyChange} onViewDetails={() => setOpenDialog('privacy')} error={errors?.agreePrivacy} required />

        {/* All Agreement Checkbox */}
        <div className='border-t border-gray-100 pt-4'>
          <div className='rounded-lg bg-gray-100/50 p-3'>
            <AgreementCheckbox id='agreeAll' label='전체 약관에 동의합니다' checked={isAllAgreed} onChange={onAgreeAll} required />
          </div>
        </div>

        {/* Error Messages */}
        {hasErrors && (
          <div>
            <ValidationError message='서비스 이용을 위해 모든 약관에 동의해주세요.' />
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className='flex justify-end'>
        <Button onClick={handleNext} disabled={!isAllAgreed} variant='primary' size='lg'>
          다음 단계
          <ArrowRight className='size-4' />
        </Button>
      </div>

      {/* Terms Dialog */}
      <Dialog open={openDialog === 'terms'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='t-h3 text-secondary'>Green Mate 이용약관</DialogTitle>
          </DialogHeader>
          <div className='prose prose-sm max-w-none'>
            <pre className='font-sans text-sm leading-relaxed whitespace-pre-wrap text-gray-700'>{TERMS_CONTENT}</pre>
          </div>
          <div className='flex justify-end pt-4'>
            <Button onClick={() => setOpenDialog(null)} variant='primary'>
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={openDialog === 'privacy'} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='t-h3 text-secondary'>개인정보 처리방침</DialogTitle>
          </DialogHeader>
          <div className='prose prose-sm max-w-none'>
            <pre className='font-sans text-sm leading-relaxed whitespace-pre-wrap text-gray-700'>{PRIVACY_CONTENT}</pre>
          </div>
          <div className='flex justify-end pt-4'>
            <Button onClick={() => setOpenDialog(null)} variant='primary'>
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
