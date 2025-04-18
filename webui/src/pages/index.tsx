import { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Tab,
  Tabs
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// 定义分析结果的接口
interface AnalysisResult {
  imageType?: string;
  bodyPart?: string;
  findings?: {
    normalStructures?: string[];
    abnormalFindings?: string[];
  };
  possibleDiagnosis?: string[];
  recommendedActions?: string[];
  severity?: string;
  confidence?: string;
  summary?: string;
  rawText?: string;
}

// 定义严重程度类型
type SeverityColor = 'error' | 'warning' | 'success' | 'default';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [useYolo, setUseYolo] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [rawContent, setRawContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<number>(0);

  // 处理文件拖拽上传
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setImage(base64String);
      setFileName(file.name);
      setAnalysis(null);
      setRawContent('');
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // 分析图片
  const analyzeImage = async () => {
    if (!image) {
      setError('请先上传图片');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/analyze', {
        imageBase64: image,
        useYolo
      });
      
      setAnalysis(response.data.result);
      setRawContent(response.data.rawContent || '');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || '分析失败，请重试');
      } else {
        setError('发生未知错误');
      }
    } finally {
      setLoading(false);
    }
  };

  // 清除当前图片和分析结果
  const clearAll = () => {
    setImage(null);
    setFileName('');
    setAnalysis(null);
    setRawContent('');
    setError('');
  };

  // 获取严重程度对应的颜色和图标
  const getSeverityInfo = (severity?: string) => {
    switch(severity?.toLowerCase()) {
      case '高':
        return { color: 'error' as SeverityColor, icon: <ReportIcon color="error" /> };
      case '中':
        return { color: 'warning' as SeverityColor, icon: <WarningIcon color="warning" /> };
      case '低':
        return { color: 'success' as SeverityColor, icon: <CheckCircleIcon color="success" /> };
      default:
        return { color: 'default' as SeverityColor, icon: undefined };
    }
  };

  // 处理Tab切换
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <MedicalServicesIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            医学影像诊断平台
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            上传医学影像
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {/* 拖拽上传区域 */}
          <Box 
            {...getRootProps()} 
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              mb: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
            {isDragActive ? (
              <Typography>拖放文件到此处...</Typography>
            ) : (
              <Typography>
                点击或拖放医学影像图片到此处
              </Typography>
            )}
          </Box>
          
          {/* 可选配置 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={useYolo} 
                  onChange={(e) => setUseYolo(e.target.checked)} 
                  disabled={true}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>使用YOLO检测</Typography>
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    (功能开发中)
                  </Typography>
                </Box>
              }
            />
            
            <Box>
              {image && (
                <Button variant="outlined" color="error" onClick={clearAll} sx={{ mr: 2 }}>
                  清除
                </Button>
              )}
              <Button 
                variant="contained" 
                startIcon={<PsychologyIcon />}
                onClick={analyzeImage}
                disabled={!image || loading}
              >
                {loading ? <CircularProgress size={24} /> : '分析图像'}
              </Button>
            </Box>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          {/* 预览和结果区域 */}
          {image && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* 图片预览 */}
              <Paper elevation={1} sx={{ p: 2, flex: 1, maxWidth: { md: '40%' } }}>
                <Typography variant="subtitle1" gutterBottom>
                  图片预览: {fileName}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <img 
                    src={`data:image/jpeg;base64,${image}`} 
                    alt="医学影像" 
                    style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} 
                  />
                </Box>
              </Paper>
              
              {/* 分析结果 */}
              <Paper elevation={1} sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" gutterBottom>
                  诊断结果
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                  </Box>
                ) : analysis ? (
                  <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <Tabs value={currentTab} onChange={handleTabChange} aria-label="结果标签页">
                        <Tab label="概述" />
                        <Tab label="详细分析" />
                        {rawContent && <Tab label="原始数据" />}
                      </Tabs>
                    </Box>
                    
                    {/* 概述标签页 */}
                    {currentTab === 0 && (
                      <Box>
                        <Card variant="outlined" sx={{ mb: 2 }}>
                          <CardContent>
                            {analysis.imageType && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                影像类型: {analysis.imageType} | 检查部位: {analysis.bodyPart}
                              </Typography>
                            )}
                            <Typography variant="body1" component="div" sx={{ mb: 1 }}>
                              {analysis.summary || '无总结信息'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              {analysis.severity && (
                                <Chip 
                                  icon={getSeverityInfo(analysis.severity).icon || undefined}
                                  label={`严重程度: ${analysis.severity}`} 
                                  color={getSeverityInfo(analysis.severity).color}
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                              {analysis.confidence && (
                                <Chip 
                                  label={`可信度: ${analysis.confidence}`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                        
                        {/* 可能的诊断 */}
                        {analysis.possibleDiagnosis && analysis.possibleDiagnosis.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              可能的诊断:
                            </Typography>
                            <List dense disablePadding>
                              {analysis.possibleDiagnosis.map((diagnosis, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                  <ListItemText primary={diagnosis} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {/* 建议行动 */}
                        {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              建议行动:
                            </Typography>
                            <List dense disablePadding>
                              {analysis.recommendedActions.map((action, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                  <ListItemText primary={action} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {/* 详细分析标签页 */}
                    {currentTab === 1 && (
                      <Box>
                        {/* 正常结构 */}
                        {analysis.findings?.normalStructures && analysis.findings.normalStructures.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="success.main" gutterBottom>
                              正常结构:
                            </Typography>
                            <List dense disablePadding>
                              {analysis.findings.normalStructures.map((item, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                  <ListItemText primary={item} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {/* 异常发现 */}
                        {analysis.findings?.abnormalFindings && analysis.findings.abnormalFindings.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" color="error.main" gutterBottom>
                              异常发现:
                            </Typography>
                            <List dense disablePadding>
                              {analysis.findings.abnormalFindings.map((item, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                  <ListItemText primary={item} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {/* 无发现情况 */}
                        {(!analysis.findings?.normalStructures || analysis.findings.normalStructures.length === 0) && 
                         (!analysis.findings?.abnormalFindings || analysis.findings.abnormalFindings.length === 0) && (
                          <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                            没有详细的发现信息
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {/* 原始数据标签页 */}
                    {currentTab === 2 && rawContent && (
                      <Box sx={{ mt: 1, overflow: 'auto', maxHeight: '400px' }}>
                        <pre style={{ 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-word',
                          fontFamily: 'inherit',
                          fontSize: '0.875rem'
                        }}>
                          {rawContent}
                        </pre>
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography sx={{ color: 'text.secondary', mt: 2 }}>
                    点击分析图像按钮开始分析
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
}
