/**
 * Client Contracts page — merges student contract strings with client-only copy
 * (working with students, post-appeal actions, toasts, payment).
 */
import { getStudentContractsT } from './studentContractsLocales';

const en = {
  yourLearning: 'Working with Students',
  yourLearningBody:
    'Remember that students are here to learn and gain experience first. They may need more guidance and communication than experienced professionals. Be patient and provide clear feedback to help them deliver quality work.',
  protect: 'Protect Your Investment',
  protectL1: 'Review milestones carefully before funding. Only fund when you are satisfied with the contract terms.',
  protectL2:
    'Try not to pay high deposits — they are just to show you are serious, nothing else. Keep initial payments reasonable.',
  protectL3: 'Use the milestone system — approve work only after reviewing deliverables.',
  protectL4: 'Communicate clearly about expectations and deadlines from the start.',
  protectL5: 'If something seems off, pause and discuss before proceeding.',
  bestPractices: 'Best Practices',
  bp1: 'Set realistic deadlines that allow for learning and iteration.',
  bp2: 'Provide constructive feedback promptly to help students improve.',
  bp3: 'Use the escrow system — your funds are protected until you approve the work.',
  bp4: 'Keep all communication professional and documented through the platform.',
  postAppealTitle: 'Appeal Closed — Action Required',
  postAppealBody: 'The appeal for this contract has been closed. Please choose how you would like to proceed:',
  completeContract: 'Complete Contract',
  cancelContractAction: 'Cancel Contract',
  completeContractDesc: 'Continue with the contract as originally signed. All milestones will proceed normally.',
  cancelContractDesc: 'Terminate the contract and refund all escrow funds to your wallet.',
  userFallback: 'User',
  contractCompletedToast: 'Contract marked as completed',
  contractCompleteFail: 'Failed to complete contract',
  contractCancelledEscrowToast: 'Contract cancelled and escrow refunded',
  contractCancelFail: 'Failed to cancel contract',
  paymobKeyMissing: 'Paymob public key is not configured (VITE_PAYMOB_PUBLIC_KEY).',
  unexpectedPayment: 'Unexpected payment response',
  fundingFailed: 'Failed to start funding',
  milestoneApproved: 'Milestone approved and payment released',
  approveMilestoneFail: 'Failed to approve milestone',
};

const it = {
  yourLearning: 'Lavorare con gli studenti',
  yourLearningBody:
    "Ricorda che gli studenti sono qui principalmente per imparare. Potrebbero aver bisogno di più guida e comunicazione dei professionisti esperti. Sii paziente e fornisci feedback chiaro per aiutarli a consegnare un lavoro di qualità.",
  protect: 'Proteggi il tuo investimento',
  protectL1: 'Rivedi attentamente le milestone prima di finanziarle. Finanzia solo se sei soddisfatto dei termini del contratto.',
  protectL2:
    'Cerca di non pagare acconti elevati: servono solo a dimostrare serietà. Mantieni i pagamenti iniziali ragionevoli.',
  protectL3: 'Usa le milestone — approva il lavoro solo dopo aver esaminato le consegne.',
  protectL4: 'Comunica chiaramente aspettative e scadenze fin dall’inizio.',
  protectL5: 'Se qualcosa non ti convince, fermati e parlane prima di procedere.',
  bestPractices: 'Buone pratiche',
  bp1: 'Imposta scadenze realistiche che tengano conto di apprendimento e iterazioni.',
  bp2: 'Fornisci feedback costruttivo in tempo per aiutare gli studenti a migliorare.',
  bp3: 'Usa l’escrow: i fondi restano protetti finché non approvi il lavoro.',
  bp4: 'Mantieni tutte le comunicazioni professionali e documentate sulla piattaforma.',
  postAppealTitle: 'Ricorso chiuso — azione richiesta',
  postAppealBody: 'Il ricorso su questo contratto è stato chiuso. Scegli come procedere:',
  completeContract: 'Completa il contratto',
  cancelContractAction: 'Annulla il contratto',
  completeContractDesc: 'Prosegui con il contratto come firmato. Le milestone continueranno normalmente.',
  cancelContractDesc: 'Annulla il contratto e rimborsa tutti i fondi in escrow al tuo portafoglio.',
  userFallback: 'Utente',
  contractCompletedToast: 'Contratto segnato come completato',
  contractCompleteFail: 'Impossibile completare il contratto',
  contractCancelledEscrowToast: 'Contratto annullato e escrow rimborsato',
  contractCancelFail: 'Impossibile annullare il contratto',
  paymobKeyMissing: 'Chiave pubblica Paymob non configurata (VITE_PAYMOB_PUBLIC_KEY).',
  unexpectedPayment: 'Risposta di pagamento imprevista',
  fundingFailed: 'Impossibile avviare il finanziamento',
  milestoneApproved: 'Milestone approvata e pagamento rilasciato',
  approveMilestoneFail: 'Impossibile approvare la milestone',
};

const ar = {
  yourLearning: 'العمل مع الطلاب',
  yourLearningBody:
    'تذكّر أن الطلاب هنا بشكل أساسي للتعلم. قد يحتاجون إلى مزيد من التواصل والتوجيه مقارنةً بالمحترفين. كن صبوراً وقدّم ملاحظات واضحة ليساعدهم على تقديم جيد.',
  protect: 'احمِ استثمارك',
  protectL1: 'راجع المراحل جيداً قبل تمويلها. موّل فقط عند رضاك عن شروط العقد.',
  protectL2: 'تجنب العربون الكبير — الهدف إظهار الجدية فقط. اجعل الدفعة الأولية معقولة.',
  protectL3: 'استخدم نظام المراحل — وافِ على العمل بعد مراجعة المخرجات.',
  protectL4: 'وضح التوقعات والمواعيد من البداية.',
  protectL5: 'إن شيئاً ما أزعجك، أوقف مؤقتاً وناقش قبل المتابعة.',
  bestPractices: 'أفضل الممارسات',
  bp1: 'ضع مواعيد نهائية واقعية تسمح بالتعلم والتعديلات.',
  bp2: 'قدّم ملاحظات بناءة بسرعة لمساعدة الطلاب.',
  bp3: 'استخدم الضمان (الescrow) — تبقى أموالك محمية حتى تعتمد العمل.',
  bp4: 'حافظ على احترافية التوثيق عبر المنصة.',
  postAppealTitle: 'أُغلق التظلم — مطلوب إجراء',
  postAppealBody: 'أُغلق تظلم هذا العقد. اختر كيف تود المتابعة:',
  completeContract: 'إكمال العقد',
  cancelContractAction: 'إلغاء العقد',
  completeContractDesc: 'المتابعة حسب العقد الموقع. تستأنف المراحل بشكل طبيعي.',
  cancelContractDesc: 'إنهاء العقد وإعادة أموال الضمان بالكامل إلى محفظتك.',
  userFallback: 'مستخدم',
  contractCompletedToast: 'تم وضع العقد كمكتمل',
  contractCompleteFail: 'تعذر إكمال العقد',
  contractCancelledEscrowToast: 'أُلغي العقد واُرجع الضمان',
  contractCancelFail: 'تعذر إلغاء العقد',
  paymobKeyMissing: 'مفتاح Paymob العام غير مضبوط (VITE_PAYMOB_PUBLIC_KEY).',
  unexpectedPayment: 'استجابة دفع غير متوقعة',
  fundingFailed: 'تعذر بدء التمويل',
  milestoneApproved: 'وافقت على المرحلة وصُرِف الدفع',
  approveMilestoneFail: 'تعذر اعتماد المرحلة',
};

const overlays = { en, it, ar };

export function getClientContractsT(lang) {
  return { ...getStudentContractsT(lang), ...(overlays[lang] || overlays.en) };
}
