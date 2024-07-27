---
title: "Amazon EBS CSI driver with terraform"
date: "2024-04-07T15:20:23-04:00"
draft: false
comments: true
toc: false
author: "Dave Gallant"
tags: ['aws', 'eks', 'ebs', 'aws-ebs-csi-driver', 'oidc', 'efs', 'aws-efs-csi-driver']
---

I recently configured the Amazon EBS CSI driver and found the setup with terraform to be more effort than expected. I wanted to avoid third-party modules and keep it as simple as possible, while remaining least privilege.

> UPDATE: This approach can also be used for the aws-efs-csi-driver

<!--more-->

The [Amazon EBS CSI driver docs](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html) mention that the following are needed:

- an existing EKS cluster
- IAM role (that allows communication to the EC2 API)
- EKS add-on (aws-ebs-csi-driver)
- OIDC provider

This sounded simple enough but I was unable to find a "grab-and-go" terraform example that followed the recommendations in the docs. I saw some suggestions about attaching an `AmazonEBSCSIDriverPolicy` policy to the node groups but did not think this was the best idea since this would allow many pods to potentially have access to the EC2 API.

After a few minutes of LLM prompting, I was unimpressed with the results. I began to piece together the config myself, and after some trial and error, this is the terraform that I came up with:

```hcl

# TLS needed for the thumbprint
provider "tls" {}

data "tls_certificate" "oidc" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

# EKS addon
resource "aws_eks_addon" "ebs_csi_driver" {
  cluster_name             = aws_eks_cluster.main.name
  addon_name               = "aws-ebs-csi-driver"
  addon_version            = "v1.29.1-eksbuild.1"
  service_account_role_arn = aws_iam_role.ebs_csi_driver.arn
}

# AWS Identity and Access Management (IAM) OpenID Connect (OIDC) provider

resource "aws_iam_openid_connect_provider" "eks" {
  url             = aws_eks_cluster.main.identity.0.oidc.0.issuer
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.oidc.certificates[0].sha1_fingerprint]
}

# IAM
resource "aws_iam_role" "ebs_csi_driver" {
  name               = "ebs-csi-driver"
  assume_role_policy = data.aws_iam_policy_document.ebs_csi_driver_assume_role.json
}

data "aws_iam_policy_document" "ebs_csi_driver_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.eks.arn]
    }

    actions = [
      "sts:AssumeRoleWithWebIdentity",
    ]

    condition {
      test     = "StringEquals"
      variable = "${aws_iam_openid_connect_provider.eks.url}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${aws_iam_openid_connect_provider.eks.url}:sub"
      values   = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
    }

  }
}

resource "aws_iam_role_policy_attachment" "AmazonEBSCSIDriverPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  role       = aws_iam_role.ebs_csi_driver.name
}
```

The above configuration follows the docs, binding an IAM role to the service account `kube-system/ebs-csi-controller-sa` using an OpenID connect provider.

After applying the changes above, I deployed [the sample application](https://docs.aws.amazon.com/eks/latest/userguide/ebs-sample-app.html) and noticed that the persistent volume claims were bound to EBS volumes.
