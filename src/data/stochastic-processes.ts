export type Bi = { fa: string; en: string };

export type StochasticProcess = {
  id: string;
  name: string;
  fa: string;
  def: Bi;
  related: string; // LaTeX or short relation
  examples: Bi;
};

export const stochasticProcesses: StochasticProcess[] = [
  {
    id: "poisson-process",
    name: "Poisson Process",
    fa: "فرآیند پواسون",
    def: {
      fa: "فرآیند شمارش‌ Markov با افزایش‌های مستقل که تعد رویداد در هر بازه زمانی به‌صورت $\\mathrm{Pois}(\\lambda t)$ است.",
      en: "A Markov counting process with independent increments where the number of events in any interval is $\\mathrm{Pois}(\\lambda t)$.",
    },
    related: "N(t)-N(s)\\sim\\mathrm{Pois}(\\lambda(t-s)),\\quad T_k\\sim\\mathrm{Erlang}(k,\\lambda)",
    examples: {
      fa: "ورود مشتری به صف، فوتون‌های رسیده در آشکارساز، زلزله‌ها در یک منطقه.",
      en: "Customer arrivals to a queue, photons hitting a detector, earthquakes in a region.",
    },
  },
  {
    id: "brownian-motion",
    name: "Brownian Motion (Wiener Process)",
    fa: "حرکت براونی (فرآیند وینر)",
    def: {
      fa: "فرآیند پیوسته‌ی Markov با افزایش‌های مستقل گاوسی؛ یعنی $W_t-W_s\\sim N(0,t-s)$ و مسیرها پیوسته‌اند.",
      en: "A continuous-path Markov process with independent Gaussian increments; $W_t-W_s\\sim N(0,t-s)$ and almost surely continuous paths.",
    },
    related: "W_t\\sim N(0,t),\\quad \\mathrm{Cov}(W_s,W_t)=\\min(s,t)",
    examples: {
      fa: "مدل قیمت در دارایی‌های مالی (Black-Scholes)، حرکت ذرات معلق در سیال.",
      en: "Asset-price modelling (Black-Scholes), motion of suspended particles in a fluid.",
    },
  },
  {
    id: "markov-chain",
    name: "Markov Chain",
    fa: "زنجیر مارکوف",
    def: {
      fa: "فرآیند گسسته‌ی زمان با ویژگی «بی‌حافظگی»: توزیع وضعیت بعدی تنها به وضعیت فعلی بستگی دارد.",
      en: "A discrete-time process with the Markov property: the next state depends only on the current state.",
    },
    related: "P(X_{n+1}=j\\mid X_n=i,\\dots)=P_{ij},\\quad \\pi=\\pi P",
    examples: {
      fa: "مدل آب‌وهوایی، صف‌ها، الگوریتم‌های تصادفی و زنجیره‌ی مارکوف مونت‌کارلو (MCMC).",
      en: "Weather models, queueing systems, randomized algorithms, and Markov chain Monte Carlo (MCMC).",
    },
  },
  {
    id: "martingale",
    name: "Martingale",
    fa: "مارتینگل",
    def: {
      fa: "فرآیندی که بهترین پیش‌بینی آینده‌ی آن در زمان $t$ همان مقدار فعلی‌اش است: $E[X_{t+1}\\mid\\mathcal{F}_t]=X_t$.",
      en: "A process whose best future prediction given current information equals today's value: $E[X_{t+1}\\mid\\mathcal{F}_t]=X_t$.",
    },
    related: "E[X_{n+1}\\mid X_1,\\dots,X_n]=X_n,\\quad \\int_0^t H_s\\,dW_s\\ \\text{is a martingale}",
    examples: {
      fa: "موجودی بازی منصفانه در قمار، قیمت برابر دارایی در بازار بدون آربیتراژ.",
      en: "Wealth in a fair game, the no-arbitrage price process in efficient markets.",
    },
  },
  {
    id: "gaussian-process",
    name: "Gaussian Process",
    fa: "فرآیند گاوسی",
    def: {
      fa: "مجموعه‌ای از متغیرهای تصادفی که هر زیرمجموعه متناهی از آن‌ها توزیع چندمتغیره‌ی نرمال دارد.",
      en: "A collection of random variables such that every finite subset has a multivariate normal distribution.",
    },
    related: "f\\sim\\mathcal{GP}(m,k),\\quad f(x)\\sim N(m(x),k(x,x'))",
    examples: {
      fa: "رگرسیون بیزی، بهینه‌سازی بیزی، مدلسازی تابع در یادگیری ماشین.",
      en: "Bayesian regression, Bayesian optimization, function modelling in machine learning.",
    },
  },
  {
    id: "branching-process",
    name: "Branching Process (Galton–Watson)",
    fa: "فرآیند شاخه‌ای (گالتون-واتسون)",
    def: {
      fa: "فرآیندی که هر نسل به‌صورت تصادفی فرزندان می‌زاید؛ تعداد فرزندان هر فرد i.i.d. است.",
      en: "A process where each generation reproduces randomly, with i.i.d. offspring counts per individual.",
    },
    related: "Z_{n+1}=\\sum_{i=1}^{Z_n}\\xi_i,\\quad \\xi_i\\overset{iid}{\\sim}p,\\quad E[Z_n]=\\mu^n",
    examples: {
      fa: "بقا نام یک خانواده، گسترش واژگی در زبان، شکست هسته‌ای زنجیره‌ای.",
      en: "Survival of family names, language propagation, neutron chain reactions.",
    },
  },
  {
    id: "renewal-process",
    name: "Renewal Process",
    fa: "فرآیند تجدید",
    def: {
      fa: "فرآیند شمارشی که زمان بین رویدادهای متوالی i.i.d. است؛ تعمیم فرآیند پواسون.",
      en: "A counting process where inter-arrival times are i.i.d.; a generalization of the Poisson process.",
    },
    related: "N(t)=\\max\\{n:S_n\\le t\\},\\quad S_n=\\sum_{i=1}^n X_i,\\ X_i\\overset{iid}{\\sim}F",
    examples: {
      fa: "جایگزینی قطعات با عمر تصادفی، تحلیل قابلیت اطمینان سیستم.",
      en: "Replacement of parts with random lifetimes, reliability analysis of systems.",
    },
  },
  {
    id: "random-walk",
    name: "Random Walk",
    fa: "قدم‌زنی تصادفی",
    def: {
      fa: "مجموع تجمعی گام‌های مستقل: $S_n=\\sum_{i=1}^n X_i$ که در آن $X_i$ مستقل و هم‌توزیع‌اند.",
      en: "The cumulative sum of independent steps: $S_n=\\sum_{i=1}^n X_i$ with $X_i$ independent and identically distributed.",
    },
    related: "S_n=\\sum_{i=1}^n X_i,\\quad \\frac{S_n}{\\sqrt{n}}\\xrightarrow{d}N(0,\\sigma^{2})",
    examples: {
      fa: "حرکت ذرات در گاز، قیمت سهام در مدل گسسته، جستجوی وب در گراف.",
      en: "Particle diffusion, discrete-time stock prices, web search on graphs.",
    },
  },
];
