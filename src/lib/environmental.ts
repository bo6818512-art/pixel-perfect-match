// Environmental licensing catalog for developer accounts. Slot 7 is conditional (educational projects with pools).
export const environmentalDocuments = [
  { slot: 1, required: true, title: 'نموذج تقييم التأثير البيئي (أ) أو (ب) أو (ج) حسب المشروع، مستوفى لكامل البيانات بوضوح ودقة', note: 'في حالة كون النشاط تجاري أو إداري أو مختلط، تقدم الدراسة البيئية دون نموذج تقييم التأثير البيئي.' },
  { slot: 2, required: true, title: 'ما يثبت ملكية المشروع (عقد ملكية / إخطار تخصيص / محضر استلام للقطعة)' },
  { slot: 3, required: true, title: 'كارت الوصف، ولوحة الموقع العام للمشروع مفصلة بمقياس رسم مناسب' },
  { slot: 4, required: true, title: 'خطة الطوارئ والإخلاء ومكافحة الحرائق للمشروع بالكامل (معتمدة من مكتب استشاري)' },
  { slot: 5, required: true, title: 'الرسومات الهندسية بالكامل للمشروع (معتمدة من مكتب استشاري)' },
  { slot: 6, required: true, title: 'بيان عام منفصل لوصف الأنشطة بالمشروع', note: 'في حالة كون النشاط تعليمي، يقدم بيان بالمراحل التعليمية المختلفة وعدد الفصول في كل مرحلة.' },
  { slot: 7, required: false, title: 'لوحات هندسية مفصلة لحمامات السباحة + بيان منفصل بإجراءات العزل والتبطين والمواد المستخدمة', note: 'مطلوب فقط إذا كان النشاط تعليمي ويحوي حمامات سباحة.' },
  { slot: 8, required: true, title: 'تفويض من الشركة المالكة للمشروع للشخص مقدم الطلب' },
] as const;

export const environmentalNotes = [
  'يتم مراجعة النموذج وإبداء الرأي فيه من الناحية البيئية فقط والاشتراطات المطلوبة، ويتم الإبلاغ بـ (الموافقة / الرفض / استكمال البيانات) خلال مدة أقصاها 30 يومًا من تاريخ الاستلام.',
  'يتم الالتزام بكافة الاشتراطات البيئية الواردة بقرار جهاز شئون البيئة لكل مشروع، ويتم التفتيش عليها للتأكد من مدى مطابقة المشروع للقانون والاشتراطات.',
];

export function missingEnvironmentalSlots(uploaded: Iterable<number>) {
  const have = new Set(uploaded);
  return environmentalDocuments.filter(d => d.required && !have.has(d.slot)).map(d => d.slot);
}
