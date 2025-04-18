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
    const { imageBase64, useYolo = false } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: '未提供图片' });
    }

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
  "possibleDiagnosis": ["可能的诊断列表，包含可能性描述"],
  "recommendedActions": ["建议的后续行动"],
  "severity": "严重程度：低/中/高",
  "confidence": "诊断可信度：低/中/高",
  "summary": "一段简明的总结"
}
请确保返回的是有效JSON格式，不要添加markdown标记、额外说明或其他非JSON内容。`;

    // 调用多模态模型
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

    const rawContent = response.choices[0]?.message?.content || "{}";
    
    // 尝试解析JSON响应
    let jsonResponse;
    try {
      // 提取原始响应中的JSON部分
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : "{}";
      jsonResponse = JSON.parse(jsonString);
    } catch (e) {
      console.error('解析JSON失败:', e);
      // 如果解析失败，则返回原始文本
      jsonResponse = { rawText: rawContent };
    }

    return res.status(200).json({
      result: jsonResponse,
      rawContent: rawContent,
      useYolo: useYolo
    });
  } catch (error: unknown) {
    console.error('分析失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return res.status(500).json({ error: `分析失败: ${errorMessage}` });
  }
} 