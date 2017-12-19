---
layout: post
title: 人工神经网络简介
date: 2017-12-19 18:53:05 +0800
categories: [coding, deep-learning, neural-network]
permalink: /:categories/:title
index: 8
---

<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=default"></script>  


Wikipedia 对于人工神经网络的介绍：

> **Artificial neural networks** (**ANNs**) or **connectionist systems** are computing systems inspired by the [biological neural networks](https://en.wikipedia.org/wiki/Biological_neural_network) that constitute animal brains. Such systems learn (progressively improve performance on) tasks by considering examples, generally without task-specific programming. For example, in image recognition, they might learn to identify images that contain cats by analyzing example images that have been manually [labeled](https://en.wikipedia.org/wiki/Labeled_data) as "cat" or "no cat" and using the results to identify cats in other images. They do this without any [a priori knowledge](https://en.wikipedia.org/wiki/A_priori_knowledge) about cats, e.g., that they have fur, tails, whiskers and cat-like faces. Instead, they evolve their own set of relevant characteristics from the learning material that they process.
>
> 人工神经网络（ANNs），或者说联结系统，是受生物上组成动物大脑的神经系统启发的计算系统。ANNs 一般是在与任务无关的场景下学习（并且渐进地提高能力）。举个图像识别的例子，ANNs 可以从已经明确标出”是猫“或“不是猫”的图片样本中学习怎么去辨别出其他图片中的猫。ANNs 能这么做，并不需要对猫这种动物有着先验的认知，也就是说不需要提前知道猫是一种有着毛发、尾巴、胡须和猫脸的生物。人工神经网络可以在处理材料的过程中进化发展出自己一套（猫的）特征集，从而来分辨出图片中的猫。

卧槽听起来好屌，好像人工神经网络是活的一样。

但屌归屌，我们还是返璞归真，从头开始说起人工神经网络，并且我会尝试用实际的例子来帮助建立感性的认识。

## 感知器 perceptron

感知器是最基本的人工神经网络单元，相当于生物中的神经元，但是远没有后者那么复杂。

感知器接受若干个二进制输入，产生一个二进制输出：

![](/screenshots/perceptron.jpg)

可见结果只能是 0 或者 1。

这里我们引入**权重 weight** 的概念，来衡量每个输入对输出 0 （或者 1）的影响；同时我们引入阈值来决定到达什么水平就输出 0 （或者 1）。

\\(ouput = \begin{cases} 1, & \mbox{if } \sum_{i} w_i x_i > \mbox{threshold}  \\ 0, & \mbox{if } \sum_{i} w_i x_i \leq \mbox{threshold}\end{cases}\\)

使用多层感知器，可以建立起简单的决策模型：

![](/screenshots/perception-layers.jpg)

这里我们再引入一个重要的概念——**偏置 bias**。它的概念与阈值相反，表示达到一个标准有多容易（阈值表示达到一个标准有多难）。

那么，上面我们对于感知器的数学定义可以变成：

$$ouput = \begin{cases} 1, & \mbox{if } \sum_{i} w_i x_i + b >0  \\ 0, & \mbox{if } \sum_{i} w_i x_i+b \leq 0\end{cases}$$

## S 型神经元

### 感知器的不足

我们说人工神经网络可以学习，其实学习的过程就是不断地改变 weight 和 bias 的值来使输出结果改变而达到更优效果的过程。但是如果简单地使用感知器，有时候调整 weight 和 bias 并不能是结果发生改变。

可以参看下面的阶跃函数：

![](/screenshots/step-function.jpg)

感知器的输入和输出的关系就跟阶跃函数一样，输入在一定范围的变动并不会使输出发生变化，很明显这并不能帮助我们构造“学习”的能力。

### sigmoid 函数

所以我们引入 S 型神经元的概念。

感知器的输出只能是 0 或者 1，而 S 型神经元可以输出 0 ~ 1 之间的数，如 0.66。比如说，辨认出图片是否为猫，感知器只能判断是否为猫，而 S 型神经元可以输出 0.66，表示有 66% 的概率是猫。

![](/screenshots/sigmoid-function.jpg)

上面为 S 型神经元的函数图像，其数学表达为：

$${\sigma(z) = \cfrac{1}{1 + e^{-z}}}$$,   其中 $${z = \sum_{i}x_iw_i + b}$$

$${\sigma(z)}$$ 常被称为**逻辑函数**，所以 S 型神经元被称为**逻辑神经元**。

$${\sigma(z)}$$ 与阶跃不同，其输入的微小变化都可以在输出上体现出来，即 $${\Delta w_i}$$ 和 $${\Delta b}$$ 都会产生 $${\Delta \mbox{output}}$$：

$${\Delta \mbox{output} \approx \sum_{i}\cfrac{\vartheta \mbox{output}}{\vartheta w_i}\Delta w_i + \cfrac{\vartheta \mbox{output}}{\vartheta b}\Delta b}$$

$${\vartheta}$$ 表示偏导数，如 $${\cfrac{\vartheta \mbox{output}}{\vartheta b}}$$ 表示 $$output$$ 对 $$b$$ 变量求导数，而将 $${w_i}$$ 作为常量看待。
