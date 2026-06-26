ImageCutter.js

概述

ImageCutter.js 是一个用于解密和重组打乱图像的 JavaScript 库。它处理被分割成水平切片并重新排列的图像，将其恢复为原始形态。

安装

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
<script src="ImageCutter.min.js"></script>
```

API 参考

JmDecrypt.decryptImageUrl(url, jmId, path, options)

从 URL 加载并解密图像。

参数 类型 描述
url string 要加载和解密的图像 URL
jmId string|number 用于图层计算的 JM ID
path string 图像路径（用于 MD5 计算）
options object 可选设置（见下方）

选项：

· format：输出图像格式（默认：'image/webp'）
· quality：图像质量 0-1（默认：0.92）
· crossOrigin：CORS 设置（默认：'anonymous'）

返回值： Promise<HTMLImageElement>

JmDecrypt.decryptImage(image, jmId, path, options)

解密已加载的图像元素。

参数 类型 描述
image HTMLImageElement 要解密的已加载图像
jmId string|number 用于图层计算的 JM ID
path string 图像路径（用于 MD5 计算）
options object 可选设置（format, quality）

返回值： Promise<HTMLImageElement>

JmDecrypt.load(url, crossOrigin)

从 URL 加载图像。

参数 类型 描述
url string 要加载的图像 URL
crossOrigin string CORS 设置（默认：'anonymous'）

返回值： Promise<HTMLImageElement>

JmDecrypt.calc(jmId, imgIndex, path)

计算图像的图层配置。

参数 类型 描述
jmId string|number JM ID
imgIndex number 图像索引号
path string 图像路径

返回值： Object 包含 layers、md5 及其他配置数据

JmDecrypt.reassemble(image, sliceCount)

通过重新排列切片来重组打乱的图像。

参数 类型 描述
image HTMLImageElement 源图像
sliceCount number 切片数量（2-100）

返回值： HTMLCanvasElement

JmDecrypt.need(jmId)

检查图像是否需要解密。

参数 类型 描述
jmId string|number 要检查的 JM ID

返回值： boolean

JmDecrypt.valid(image)

验证对象是否为正确加载的图像元素。

参数 类型 描述
image * 要验证的对象

返回值： boolean

使用示例

```javascript
JmDecrypt.decryptImageUrl(
    'https://example.com/image.webp',
    '1169826',
    '00001'
).then(function(img) {
    document.body.appendChild(img);
}).catch(function(err) {
    console.error('解密失败:', err.message);
});
```

算法原理

该库的工作流程：

1. 确定图层数量：基于 JM ID 和 MD5 哈希值计算
2. 分割图像：将图像按计算出的尺寸水平分割为多个切片
3. 重组切片：根据 MD5 哈希值以特定顺序重新排列切片
4. 导出结果：将重组后的图像导出为新的图像元素

浏览器支持

需要支持：

· Canvas API
· ES6 Promise
· HTMLImageElement

许可证

MIT