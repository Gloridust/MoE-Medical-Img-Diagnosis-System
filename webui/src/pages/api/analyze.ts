import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    console.log('收到分析请求');
    const { imageBase64, useYolo = false } = req.body;

    if (!imageBase64) {
      console.error('请求验证失败: 缺少imageBase64参数');
      return res.status(400).json({ error: '未提供图片数据，请确保传递了imageBase64参数' });
    }

    // 验证图片格式
    if (typeof imageBase64 !== 'string') {
      console.error('请求验证失败: imageBase64不是字符串类型');
      return res.status(400).json({ error: 'imageBase64必须是字符串类型' });
    }

    console.log('准备图片数据，使用YOLO:', useYolo);
    
    // 将base64转换为OpenAI可接受的格式
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

    // 构建提示词 - 要求输出结构化JSON
    const prompt = `请详细分析这张医学影像，并以JSON格式返回中文结果，格式如下：
{
  "imageType": "影像类型，如CT、MRI、X光等",
  "bodyPart": "检查的身体部位",
  "findings": {
    "normalStructures": ["可见的正常结构列表"],
    "abnormalFindings": ["异常发现列表"]
  },
  "possibleDiagnosis": [
    {
      "diagnosis": "诊断1",
      "confidence": "可信度百分比，如85%"
    },
    {
      "diagnosis": "诊断2",
      "confidence": "可信度百分比，如65%"
    }
  ],
  "recommendedActions": ["建议的后续行动"],
  "severity": "严重程度：低/中/高",
  "confidence": {
    "overall": "总体诊断可信度：低/中/高",
    "percentage": "可信度百分比，如75%",
    "factors": ["影响可信度的因素，如图像质量、特征明显程度等"]
  },
  "summary": "一段简明的总结"
}
请确保返回的是有效JSON格式，不要添加markdown标记、额外说明或其他非JSON内容。针对每个诊断给出可信度百分比，并在confidence字段中提供总体可信度评估。无论如何都不要返回除了规定的 json 格式以外的内容。`;

    // 调用多模态模型
    console.log('开始调用AI模型分析...');
    const response = await openai.chat.completions.create({
      model: process.env.QWEN_MODEL || "qwen-vl-max",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ]
    });
    console.log('AI模型分析完成，开始处理结果');

    const rawContent = response.choices[0]?.message?.content || "{}";
    console.log('原始返回内容:', rawContent);
    
    // 尝试解析JSON响应
    let jsonResponse;
    try {
      // 提取原始响应中的JSON部分
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : "{}";
      console.log('提取的JSON字符串:', jsonString);
      jsonResponse = JSON.parse(jsonString);
    } catch (e) {
      console.error('解析JSON失败:', e);
      // 如果解析失败，则返回原始文本
      jsonResponse = { rawText: rawContent };
    }

    console.log('分析完成，返回结果');
    return res.status(200).json({
      result: jsonResponse,
      rawContent: rawContent,
      useYolo: useYolo
    });
  } catch (error: unknown) {
    console.error('分析失败:', error);
    
    // 记录更多详细的错误信息用于调试
    if (error instanceof Error) {
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // 尝试记录更多API相关信息（如果存在）
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API错误详情:', {
        status: error.status,
        headers: error.headers,
        type: error.type,
        code: error.code,
        param: error.param,
        message: error.message
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return res.status(500).json({ error: `分析失败: ${errorMessage}` });
  }
} 