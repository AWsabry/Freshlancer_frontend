/**
 * Client Appeals page — extends student appeal strings with cancel-contract copy.
 */
import { getStudentAppealsT } from './studentAppealsLocales';

const en = {
  na: 'N/A',
  cancelSectionTitle: 'Cancel Contract',
  cancelSectionBody:
    "If you cancel the contract, all escrow funds will be refunded to the client's wallet. This action cannot be undone.",
  cancelContractCta: 'Cancel Contract',
  cancelModalTitle: 'Cancel Contract',
  cancelModalBody:
    "Are you sure you want to cancel this contract? All escrow funds will be refunded to the client's wallet.",
  cancelModalIrreversible: 'This action cannot be undone. The contract will be permanently cancelled.',
  confirmCancelContract: 'Confirm Cancellation',
  modalDismiss: 'Cancel',
  downloadDocumentError: 'Failed to download document: {msg}',
  unknownError: 'Unknown error',
  downloadFileFailed: 'Failed to download file',
  contractCancelledEscrow: 'Contract cancelled and escrow refunded',
  cancelContractFail: 'Failed to cancel contract',
};

const it = {
  na: 'N/D',
  cancelSectionTitle: 'Annulla contratto',
  cancelSectionBody:
    'Se annulli il contratto, tutti i fondi in escrow verranno rimborsati al portafoglio del cliente. L’azione non è reversibile.',
  cancelContractCta: 'Annulla contratto',
  cancelModalTitle: 'Annulla contratto',
  cancelModalBody:
    'Confermi di voler annullare questo contratto? Tutti i fondi in escrow verranno rimborsati al portafoglio del cliente.',
  cancelModalIrreversible: 'Azione irreversibile. Il contratto sarà annullato definitivamente.',
  confirmCancelContract: 'Conferma annullamento',
  modalDismiss: 'Annulla',
  downloadDocumentError: 'Download documento non riuscito: {msg}',
  unknownError: 'Errore sconosciuto',
  downloadFileFailed: 'Download file non riuscito',
  contractCancelledEscrow: 'Contratto annullato e escrow rimborsato',
  cancelContractFail: 'Impossibile annullare il contratto',
};

const ar = {
  na: 'غير متوفر',
  cancelSectionTitle: 'إلغاء العقد',
  cancelSectionBody: 'عند إلغاء العقد تُعاد أموال الضمان بالك إلى محفظة العميل. لا يمكن التراجع.',
  cancelContractCta: 'إلغاء العقد',
  cancelModalTitle: 'إلغاء العقد',
  cancelModalBody: 'هل تريد بالتأكيد إلغاء هذا العقد؟ تُعاد أموال الضمان بالك إلى محفظة العميل.',
  cancelModalIrreversible: 'لا يمكن التراجع — سيُلغى العقد نهائياً.',
  confirmCancelContract: 'تأكيد الإلغاء',
  modalDismiss: 'رجوع',
  downloadDocumentError: 'تعذر تنزيل المستند: {msg}',
  unknownError: 'خطأ غير معروف',
  downloadFileFailed: 'تعذر تنزيل الملف',
  contractCancelledEscrow: 'أُلغي العقد واُرجع الضمان',
  cancelContractFail: 'تعذر إلغاء العقد',
};

const extras = { en, it, ar };

export function getClientAppealsT(lang) {
  return { ...getStudentAppealsT(lang), ...(extras[lang] || extras.en) };
}
