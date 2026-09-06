export type Bi = { fa: string; en: string };

export type DecisionNode = {
  id: string;
  question: Bi;
  options: { label: Bi; next: string }[]; // next = node id or a distribution id prefixed "dist:"
};

export type DecisionResult = { id: string; distId: string; reason: Bi };

export const decisionTree: {
  start: string;
  nodes: Record<string, DecisionNode>;
  results: Record<string, DecisionResult>;
} = {
  start: "start",
  nodes: {
    start: {
      id: "start",
      question: {
        fa: "متغیر تصادفی گسسته است یا پیوسته؟",
        en: "Is the random variable discrete or continuous?",
      },
      options: [
        { label: { fa: "گسسته", en: "Discrete" }, next: "q_disc_kind" },
        { label: { fa: "پیوسته", en: "Continuous" }, next: "q_cont_support" },
      ],
    },
    q_disc_kind: {
      id: "q_disc_kind",
      question: {
        fa: "متغیر چه چیزی را مدل می‌کند؟",
        en: "What does the variable model?",
      },
      options: [
        {
          label: { fa: "تعداد رویداد (شمارش)", en: "Count of events" },
          next: "q_disc_count_finite",
        },
        {
          label: { fa: "تعداد تلاش تا موفقیت", en: "Trials until success" },
          next: "q_disc_wait_count",
        },
        {
          label: { fa: "هر مقدار صحیح در بازه یکسان است", en: "Equal over an integer range" },
          next: "dist:discrete-uniform",
        },
      ],
    },
    q_disc_count_finite: {
      id: "q_disc_count_finite",
      question: {
        fa: "شمارش با سقف $n$ کراندار است یا نامکران؟",
        en: "Is the count bounded by some $n$, or unbounded?",
      },
      options: [
        {
          label: { fa: "کراندار $0\\le x\\le n$", en: "Bounded $0\\le x\\le n$" },
          next: "q_disc_bounded_kind",
        },
        {
          label: { fa: "نامکران $x=0,1,2,\\dots$", en: "Unbounded $x=0,1,2,\\dots$" },
          next: "q_disc_unbounded_kind",
        },
      ],
    },
    q_disc_bounded_kind: {
      id: "q_disc_bounded_kind",
      question: {
        fa: "نمونه‌گیری چگونه است؟",
        en: "How is sampling performed?",
      },
      options: [
        {
          label: {
            fa: "بدون جایگذاری از جامعه متناهی",
            en: "Without replacement from a finite population",
          },
          next: "dist:hypergeometric",
        },
        {
          label: { fa: "دو خروجی، آزمایش مستقل", en: "Two outcomes, independent trials" },
          next: "q_disc_trials",
        },
        {
          label: { fa: "چند رده", en: "Multiple categories" },
          next: "dist:multinomial",
        },
      ],
    },
    q_disc_trials: {
      id: "q_disc_trials",
      question: {
        fa: "چند آزمایش برنولی انجام می‌شود؟",
        en: "How many Bernoulli trials are run?",
      },
      options: [
        { label: { fa: "یک آزمایش", en: "A single trial" }, next: "dist:bernoulli" },
        { label: { fa: "$n$ آزمایش", en: "Fixed $n$ trials" }, next: "dist:binomial" },
      ],
    },
    q_disc_unbounded_kind: {
      id: "q_disc_unbounded_kind",
      question: {
        fa: "شمارش چه چیزی است؟",
        en: "What is being counted?",
      },
      options: [
        {
          label: {
            fa: "رویدادهای نادر با نرخ ثابت $\\lambda$",
            en: "Rare events at constant rate $\\lambda$",
          },
          next: "dist:poisson",
        },
        {
          label: { fa: "تعداد تلاش تا موفقیت", en: "Trials until a success" },
          next: "q_disc_wait_count",
        },
      ],
    },
    q_disc_wait_count: {
      id: "q_disc_wait_count",
      question: {
        fa: "چند موفقیت مورد انتظار است؟",
        en: "How many successes are you waiting for?",
      },
      options: [
        {
          label: { fa: "تا اولین موفقیت", en: "Until the first success" },
          next: "dist:geometric",
        },
        {
          label: { fa: "تا $r$امین موفقیت", en: "Until the $r$-th success" },
          next: "dist:negative-binomial",
        },
      ],
    },
    q_cont_support: {
      id: "q_cont_support",
      question: {
        fa: "دامنه (پشتیبانی) متغیر چیست؟",
        en: "What is the support of the variable?",
      },
      options: [
        {
          label: { fa: "کراندار $[a,b]$", en: "Bounded $[a,b]$" },
          next: "q_cont_bounded_kind",
        },
        {
          label: { fa: "$[0,\\infty)$ (نامنفی)", en: "$[0,\\infty)$ (non-negative)" },
          next: "q_cont_pos_kind",
        },
        {
          label: { fa: "$\\mathbb{R}$ (کل اعداد حقیقی)", en: "$\\mathbb{R}$ (the whole real line)" },
          next: "q_cont_real_kind",
        },
        {
          label: { fa: "$[x_m,\\infty)$ با حداقل $x_m$", en: "$[x_m,\\infty)$ with floor $x_m$" },
          next: "dist:pareto",
        },
      ],
    },
    q_cont_bounded_kind: {
      id: "q_cont_bounded_kind",
      question: {
        fa: "دامنه دقیقاً چه بازه‌ای است؟",
        en: "Which bounded interval is the support?",
      },
      options: [
        { label: { fa: "$[0,1]$ (احتمال/نسبت)", en: "$[0,1]$ (probability/ratio)" }, next: "dist:beta" },
        { label: { fa: "$[a,b]$ دلخواه", en: "Arbitrary $[a,b]$" }, next: "dist:continuous-uniform" },
      ],
    },
    q_cont_pos_kind: {
      id: "q_cont_pos_kind",
      question: {
        fa: "متغیر چه ویژگی کلیدی دارد؟",
        en: "Which key property does the variable have?",
      },
      options: [
        {
          label: {
            fa: "بی‌حافظگی $P(X>s+t\\mid X>s)=P(X>t)$",
            en: "Memoryless $P(X>s+t\\mid X>s)=P(X>t)$",
          },
          next: "dist:exponential",
        },
        {
          label: { fa: "چوله به راست/تک‌حالتی", en: "Right-skewed / unimodal" },
          next: "q_cont_pos_skew",
        },
      ],
    },
    q_cont_pos_skew: {
      id: "q_cont_pos_skew",
      question: {
        fa: "ساختار چولگی به راست چه‌گونه است؟",
        en: "What shapes the right skew?",
      },
      options: [
        {
          label: {
            fa: "حاصل‌ضرب چند عامل مثبت (لگاریتم نرمال است)",
            en: "Product of positive factors (log is normal)",
          },
          next: "dist:lognormal",
        },
        {
          label: {
            fa: "نرخ خطر انعطاف‌پذیر (قابلیت اطمینان)",
            en: "Flexible hazard rate (reliability)",
          },
          next: "dist:weibull",
        },
        {
          label: {
            fa: "مجموع چند نمایی / زمان انتظار تا $k$ رویداد",
            en: "Sum of exponentials / waiting time to $k$ events",
          },
          next: "dist:gamma",
        },
      ],
    },
    q_cont_real_kind: {
      id: "q_cont_real_kind",
      question: {
        fa: "دم‌ها و تقارن چه‌گونه‌اند؟",
        en: "How do tails and symmetry look?",
      },
      options: [
        {
          label: { fa: "متقارن، زنگوله‌ای، دم نازک", en: "Symmetric, bell-shaped, thin tails" },
          next: "dist:normal",
        },
        {
          label: { fa: "اوج تیز، دم‌های پهن", en: "Sharp peak, fat tails" },
          next: "dist:laplace",
        },
        {
          label: {
            fa: "دم سنگین، میانگین موجود اما سنگین‌تر از نرمال",
            en: "Heavy tails, mean exists but heavier than normal",
          },
          next: "dist:student-t",
        },
        {
          label: {
            fa: "دم بسیار سنگین، میانگین ندارد",
            en: "Extremely heavy tails, no mean",
          },
          next: "dist:cauchy",
        },
      ],
    },
  },
  results: {
    "dist:discrete-uniform": {
      id: "dist:discrete-uniform",
      distId: "discrete-uniform",
      reason: {
        fa: "هر مقدار صحیح در بازه $[a,b]$ با احتمال یکسان؛ نظیره گسسته یکنواخت پیوسته.",
        en: "Every integer in $[a,b]$ is equally likely; the discrete analogue of the continuous uniform.",
      },
    },
    "dist:hypergeometric": {
      id: "dist:hypergeometric",
      distId: "hypergeometric",
      reason: {
        fa: "نمونه‌گیری بدون جایگذاری از جامعه متناهی؛ وابستگی میان آزمایش‌ها از ضریب تصحیح متناهی پدیدار می‌شود.",
        en: "Sampling without replacement from a finite population; dependence among trials appears as a finite-population correction.",
      },
    },
    "dist:multinomial": {
      id: "dist:multinomial",
      distId: "multinomial",
      reason: {
        fa: "تعمیم دو جمله‌ای به $k$ رده؛ هر نمونه در یکی از رده‌ها با احتمال $p_i$ می‌افتد.",
        en: "Binomial generalization to $k$ categories; each trial lands in category $i$ with probability $p_i$.",
      },
    },
    "dist:bernoulli": {
      id: "dist:bernoulli",
      distId: "bernoulli",
      reason: {
        fa: "یک آزمایش بولی با دو خروجی موفق/شکست و احتمال موفقیت $p$.",
        en: "A single Boolean trial with success probability $p$.",
      },
    },
    "dist:binomial": {
      id: "dist:binomial",
      distId: "binomial",
      reason: {
        fa: "تعداد موفقیت در $n$ آزمایش برنولی مستقل؛ مجموع $n$ متغیر برنولی است.",
        en: "Number of successes in $n$ independent Bernoulli trials; the sum of $n$ Bernoulli variables.",
      },
    },
    "dist:poisson": {
      id: "dist:poisson",
      distId: "poisson",
      reason: {
        fa: "رویدادهای نادر و مستقل با نرخ $\\lambda$؛ میانگین و واریانس هر دو $\\lambda$.",
        en: "Rare, independent events at rate $\\lambda$; mean and variance both equal $\\lambda$.",
      },
    },
    "dist:geometric": {
      id: "dist:geometric",
      distId: "geometric",
      reason: {
        fa: "تعداد آزمایش تا اولین موفقیت؛ نظیره گسسته نمایی و بی‌حافظه.",
        en: "Number of trials until the first success; the discrete analogue of the exponential, memoryless.",
      },
    },
    "dist:negative-binomial": {
      id: "dist:negative-binomial",
      distId: "negative-binomial",
      reason: {
        fa: "تعداد آزمایش تا $r$امین موفقیت؛ تعمیم هندسی و مجموع $r$ هندسی مستقل.",
        en: "Number of trials until the $r$-th success; generalizes the geometric as a sum of $r$ independent geometrics.",
      },
    },
    "dist:beta": {
      id: "dist:beta",
      distId: "beta",
      reason: {
        fa: "پشتیبانی روی $[0,1]$ و انعطاف شکل؛ پیشین مزدوج برنولی و مدل احتمال برای احتمال‌ها.",
        en: "Support on $[0,1]$ with flexible shape; conjugate prior for Bernoulli and a model for probabilities.",
      },
    },
    "dist:continuous-uniform": {
      id: "dist:continuous-uniform",
      distId: "continuous-uniform",
      reason: {
        fa: "چگالی ثابت روی $[a,b]$؛ پایه روش تبدیل معکوس برای تولید عدد تصادفی.",
        en: "Constant density on $[a,b]$; basis of inverse-transform sampling.",
      },
    },
    "dist:pareto": {
      id: "dist:pareto",
      distId: "pareto",
      reason: {
        fa: "پشتیبانی روی $[x_m,\\infty)$ و دم قانون توان؛ پدیده‌های ۸۰/۲۰ مانند ثروت و ترافیک.",
        en: "Support on $[x_m,\\infty)$ with a power-law tail; 80/20 phenomena like wealth and traffic.",
      },
    },
    "dist:exponential": {
      id: "dist:exponential",
      distId: "exponential",
      reason: {
        fa: "تنها توزیع پیوسته بی‌حافظه؛ فاصله میان رویدادها در فرآیند پواسون.",
        en: "The only continuous memoryless distribution; inter-arrival time in a Poisson process.",
      },
    },
    "dist:lognormal": {
      id: "dist:lognormal",
      distId: "lognormal",
      reason: {
        fa: "نتیجه حاصل‌ضرب بسیاری از عوامل مثبت؛ لگاریتم آن نرمال است و دم راست کشیده.",
        en: "Result of multiplying many positive factors; its log is normal with a long right tail.",
      },
    },
    "dist:weibull": {
      id: "dist:weibull",
      distId: "weibull",
      reason: {
        fa: "نرخ خطر انعطاف‌پذیر ($k<1$ کاهشی، $k=1$ ثابت، $k>1$ افزایشی)؛ قابلیت اطمینان.",
        en: "Flexible hazard rate ($k<1$ decreasing, $k=1$ constant, $k>1$ increasing); reliability modelling.",
      },
    },
    "dist:gamma": {
      id: "dist:gamma",
      distId: "gamma",
      reason: {
        fa: "مجموع $\\alpha$ نمایی مستقل؛ تعمیم نمایی و کای-دو و ارلانگ.",
        en: "Sum of $\\alpha$ independent exponentials; generalizes exponential, chi-square, and Erlang.",
      },
    },
    "dist:normal": {
      id: "dist:normal",
      distId: "normal",
      reason: {
        fa: "متقارن، زنگوله‌ای، با دم نازک؛ نتیجه CLT برای جمع متغیرهای مستقل.",
        en: "Symmetric, bell-shaped, with thin tails; the CLT limit of sums of independent variables.",
      },
    },
    "dist:laplace": {
      id: "dist:laplace",
      distId: "laplace",
      reason: {
        fa: "اوج تیز در $\\mu$ و دم‌های نمایی متقارن؛ تفاضل دو نمایی مستقل.",
        en: "Sharp peak at $\\mu$ with symmetric exponential tails; the difference of two independent exponentials.",
      },
    },
    "dist:student-t": {
      id: "dist:student-t",
      distId: "student-t",
      reason: {
        fa: "متقارن با دم‌های سنگین‌تر از نرمال؛ برای نمونه‌های کوچک با واریانس ناشناخته.",
        en: "Symmetric with tails heavier than the normal; used for small samples with unknown variance.",
      },
    },
    "dist:cauchy": {
      id: "dist:cauchy",
      distId: "cauchy",
      reason: {
        fa: "دم‌های بسیار سنگین؛ میانگین و واریانس تعریف‌نشده؛ نسبت دو نرمال استاندارد.",
        en: "Extremely heavy tails; mean and variance undefined; the ratio of two standard normals.",
      },
    },
  },
};
