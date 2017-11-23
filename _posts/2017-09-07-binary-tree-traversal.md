---
layout: post
title: 二叉树遍历
date: 2017-09-07 14:48:05 +0800
categories: [coding, algorithms]
permalink: /:categories/:title
index: 2
---

## 层次优先遍历（BFS）

层次优先的遍历过程是逐层向下遍历，这种操作需要在遍历当前层次节点的时候，把下一层的节点保存起来，以此类推。  

另外，为保证先保存起来的节点先被访问到，我们需要**队列**这样的数据结构。

```java
//例如我们有一下这么一棵二叉树
//		1
//     / \
//    2   3
//   /   / \
//  4   5   6

//定义节点
class TreeNode {
    TreeNode left;
    TreeNode right;
    int val;

    public TreeNode(int val) {
        this.val = val;
    }
}

public List<Double> travesalBFS(TreeNode root) {
    Queue<TreeNode> queue = new ArrayDeque<>();
    queue.add(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();   //取出队列中的节点
            //这里可以获取节点的信息
            if (node.left != null) queue.offer(node.left);  //将下一层的节点加入到队列中
            if (node.right != null) queue.offer(node.right);
        }
    }
}
```
