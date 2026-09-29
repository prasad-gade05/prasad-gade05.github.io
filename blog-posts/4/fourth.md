---
title: "ML Research Hygiene Practices that Most Tutorials Skip"
date: "2026-09-29"
thumbnail: "/blogs/assets/ml-research-hygiene-practices-that-most-tutorials-skip.png"
category: ["Technical"]
slug: "ml-research-hygiene-practices-that-most-tutorials-skip"
---

# ML Research Hygiene Practices that Most Tutorials Skip

> In today's landscape, where everyone has free and hassle-free access to LLMs, the problem of just blindly following what your LLM tells you—or just blindly following what everyone else is bragging about on LinkedIn and gathering hundreds of likes—has become very common. And ironically, more so in the very field which is the foundation of these LLMs: yes, I am talking about machine learning.
>
> I think the primary reason for this is that people do not really understand machine learning at its core. The majority just watch a few YouTube playlists, read a few blogs, clone a GitHub repo, or ask their LLMs. There's nothing wrong with it, but that within itself is not enough to prove that your ML model is worthy.

Here are a few ML habits which I learnt over the years which will definitely make your ML model more robust and worth talking about next time:

---

#### 1. Paired Bootstrapping

Assume we have two cooks that make food for the same 100 customers. 52 customers liked the food made by Cook A, and 48 liked the food made by Cook B. Based on this, can we say that Cook A is better?

**No.** Because if just 2 customers change their mind, Cook B would have more votes.

Here is what most tutorials do and most LLMs suggest:

```text
model_A = 0.84
model_B = 0.81
A wins.
```

Notice we just did one run, one test set, and no checking if the win is real or just luck—as in the case of our example of the cooks.

Here is what we should do instead (again continuing with our cooks and customers example): do a taste test again and again with the same 100 customers. Every time, pick 100 customers **with replacement** (some might get repeated, some might get skipped). Check what the winners are.

- If A wins **295/300**, we can trust it.
- If A wins **160/300**, we can call it what it was: just luck.

This is called **paired bootstrapping**. Here we have the same test items, and we resample the test indices with replacement, usually 300 times. Each time we compute:

$$\text{metric}(A) - \text{metric}(B)$$

This gives us a distribution of differences. We report this mean difference along with a **95% confidence interval** from percentiles. If the interval does not include $0$, we can say the win of a model is significant and our model actually performs better and did not just get lucky.

---

#### 2. Ablation

You buy a car and it has a spoiler, alloy wheels, a turbocharger, suspension, an air intake, etc. The seller tells you all of these drastically improve the vehicle's performance. The question is: how do you actually test which of these components actually improve the performance and which do not matter?

We can remove one component at a time and then test the car's performance:

- **Remove the alloy wheels:** Speed is the same.
- **Remove the suspension:** Small change.
- **Remove the turbocharger:** You notice a huge gap in the performance.

Now you know which component actually matters.

This is exactly what you should do in an ML model. Having 5 ideas/components in one model is great until you do not know which actually matters. This is called an **ablation study**.

Here, we define switches for each component (for example: `no_low_pass`, `no_high_pass`, `no_graph`, `no_batch_norm`, `no_residual`), and we vary one switch at a time. The best result is a neutral ablation, meaning every component in your model is important.

---

#### 3. Split-conformal prediction with coverage and efficiency reporting

This one's my particular favourite... Take, for example, a weather app that says:

> _"Tomorrow it might rain or not rain. 100% Guarantee."_

Is that true? **Yes.**  
Helpful? **Not really.**

Because it gave you both answers. Your model can get 100% coverage by predicting both classes, but the predictor itself is useless.

The clear solution to this is to always report two numbers: **how often the model was right**, and **how big was the answer**:

> _"I was right 100% of the time, but my answer always had two options."_

This version of the metrics is more honest.

This is called **split-conformal prediction with coverage and efficiency reporting**. Here, we hold out a calibration set which is never used for training or threshold selection.

For each calibration point, we compute a nonconformity score:

$$s = 1 - p_y$$

_(where $p_y$ is the predicted probability of the actual true class)._

For a target error rate $\alpha$ (e.g., $0.10$ for $90\%$ coverage), you set the threshold $q$ to the $\frac{\lceil (n+1)(1-\alpha) \rceil}{n}$ quantile of the calibration scores.

At test time, the prediction set is:

$$C(x) = \{ y : 1 - p_y \le q \}$$

We then report two numbers:

1. **Empirical coverage:** The fraction of test sets containing the true label (measures _validity_).
2. **Mean set size:** The average number of labels per set (measures _efficiency_).

---

#### 4. Temporal distribution-shift diagnostics without generalization claims

Assume you create an accident predictor model and you say:

> _"My accident predictor works for all seasons."_

If you have watched traffic on a road for 12 months, you see cars change (e.g., more trucks in winter, more bikes in summer, etc.). From this, your model cannot claim seasonal accident performance, because we just measured traffic change and not the per-season accidents.

The simplest solution is to **separate your claims from what you actually measured**.

If you have measured feature change over time, claim feature change over time. Do not claim that _"my model generalizes over time"_ unless you have time-stamped labels and time-split evaluation.

---

> Honestly, none of these habits will make your model numbers bigger; in fact, most of them will make them smaller. Instead, they make your numbers believable. These make your models robust to thorough, research-level questioning. Adhering to these will make your model/research stand out—not because the numbers are fancy, but because your practices are hard to doubt.
