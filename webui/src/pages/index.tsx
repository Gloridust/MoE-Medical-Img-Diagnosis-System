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
  Tabs,
  useTheme,
  alpha,
  Avatar,
  Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ScienceIcon from '@mui/icons-material/Science';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
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
  const theme = useTheme();
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
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Avatar sx={{ mr: 2, bgcolor: alpha(theme.palette.common.white, 0.2) }}>
            <HealthAndSafetyIcon />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
            医学影像诊断平台
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            bgcolor: theme.palette.background.paper
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MedicalServicesIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h5" gutterBottom sx={{ mb: 0, fontWeight: 500 }}>
              上传医学影像
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {/* 拖拽上传区域 */}
          <Box 
            {...getRootProps()} 
            sx={{
              border: `2px dashed ${isDragActive ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.2)}`,
              borderRadius: 3,
              p: 4,
              mb: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderColor: theme.palette.primary.main
              }
            }}
          >
            <input {...getInputProps()} />
            <Box 
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mb: 2
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 36 }} />
              </Avatar>
              {isDragActive ? (
                <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 500 }}>
                  释放文件开始上传...
                </Typography>
              ) : (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    点击或拖放医学影像图片到此处
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    支持 JPG、PNG、DICOM 等格式
                  </Typography>
                </>
              )}
            </Box>
          </Box>
          
          {/* 可选配置 */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScienceIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <FormControlLabel
                control={
                  <Switch 
                    checked={useYolo} 
                    onChange={(e) => setUseYolo(e.target.checked)} 
                    disabled={true}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>使用YOLO检测</Typography>
                    <Tooltip title="YOLO目标检测功能正在开发中，敬请期待">
                      <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
            
            <Box>
              {image && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={clearAll} 
                  sx={{ 
                    mr: 2,
                    borderRadius: 6,
                    px: 3
                  }}
                >
                  清除
                </Button>
              )}
              <Button 
                variant="contained" 
                startIcon={<PsychologyIcon />}
                onClick={analyzeImage}
                disabled={!image || loading}
                sx={{ 
                  borderRadius: 6,
                  px: 3
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : '分析图像'}
              </Button>
            </Box>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-icon': { alignItems: 'center' }
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* 预览和结果区域 */}
          {image && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* 图片预览 */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  flex: 1, 
                  maxWidth: { md: '40%' },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: 'hidden'
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block', 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main',
                      mr: 1
                    }} 
                  />
                  图片预览: {fileName}
                </Typography>
                <Box sx={{ 
                  textAlign: 'center', 
                  mt: 2,
                  borderRadius: 2, 
                  overflow: 'hidden',
                  bgcolor: 'background.default',
                  p: 1
                }}>
                  <img 
                    src={`data:image/jpeg;base64,${image}`} 
                    alt="医学影像" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px', 
                      objectFit: 'contain',
                      borderRadius: 8 
                    }} 
                  />
                </Box>
              </Paper>
              
              {/* 分析结果 */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block', 
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main',
                      mr: 1
                    }} 
                  />
                  诊断结果
                </Typography>
                
                {loading ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '250px',
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    mt: 2
                  }}>
                    <CircularProgress size={50} thickness={4} />
                    <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                      正在分析医学影像...
                    </Typography>
                  </Box>
                ) : analysis ? (
                  <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <Tabs 
                        value={currentTab} 
                        onChange={handleTabChange} 
                        aria-label="结果标签页"
                        variant="fullWidth"
                        sx={{
                          '& .MuiTab-root': {
                            py: 1.5
                          }
                        }}
                      >
                        <Tab label="概述" />
                        <Tab label="详细分析" />
                        {rawContent && <Tab label="原始数据" />}
                      </Tabs>
                    </Box>
                    
                    {/* 概述标签页 */}
                    {currentTab === 0 && (
                      <Box sx={{ px: 1 }}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            mb: 2, 
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            border: 'none'
                          }}
                        >
                          <CardContent>
                            {analysis.imageType && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>影像类型:</Box> {analysis.imageType} 
                                {analysis.bodyPart && (
                                  <> | <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>检查部位:</Box> {analysis.bodyPart}</>
                                )}
                              </Typography>
                            )}
                            <Typography variant="body1" component="div" sx={{ mb: 1, lineHeight: 1.6 }}>
                              {analysis.summary || '无总结信息'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                              {analysis.severity && (
                                <Chip 
                                  icon={getSeverityInfo(analysis.severity).icon || undefined}
                                  label={`严重程度: ${analysis.severity}`} 
                                  color={getSeverityInfo(analysis.severity).color}
                                  size="small" 
                                  variant="outlined"
                                  sx={{ borderRadius: 10 }}
                                />
                              )}
                              {analysis.confidence && (
                                <Chip 
                                  label={`可信度: ${analysis.confidence}`} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ borderRadius: 10 }}
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                        
                        {/* 可能的诊断 */}
                        {analysis.possibleDiagnosis && analysis.possibleDiagnosis.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography 
                              variant="subtitle2" 
                              gutterBottom 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'primary.main',
                                fontWeight: 500,
                                mb: 1
                              }}
                            >
                              可能的诊断:
                            </Typography>
                            <List 
                              dense 
                              disablePadding
                              sx={{ 
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                borderRadius: 2,
                                p: 1
                              }}
                            >
                              {analysis.possibleDiagnosis.map((diagnosis, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.75 }}>
                                  <ListItemText 
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box 
                                          component="span" 
                                          sx={{ 
                                            minWidth: 20, 
                                            height: 20,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            mt: 0.25
                                          }}
                                        >
                                          {index + 1}
                                        </Box>
                                        <span>{diagnosis}</span>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {/* 建议行动 */}
                        {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              gutterBottom
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'primary.main',
                                fontWeight: 500,
                                mb: 1
                              }}
                            >
                              建议行动:
                            </Typography>
                            <List 
                              dense 
                              disablePadding
                              sx={{ 
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                borderRadius: 2,
                                p: 1
                              }}
                            >
                              {analysis.recommendedActions.map((action, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.75 }}>
                                  <ListItemText 
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Box 
                                          component="span" 
                                          sx={{ 
                                            minWidth: 20, 
                                            height: 20,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: 'secondary.main',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            mt: 0.25
                                          }}
                                        >
                                          {index + 1}
                                        </Box>
                                        <span>{action}</span>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {/* 详细分析标签页 */}
                    {currentTab === 1 && (
                      <Box sx={{ px: 1 }}>
                        {/* 正常结构 */}
                        {analysis.findings?.normalStructures && analysis.findings.normalStructures.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography 
                              variant="subtitle2" 
                              gutterBottom 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'success.main',
                                fontWeight: 500,
                                mb: 1
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />
                              正常结构:
                            </Typography>
                            <List 
                              dense 
                              disablePadding
                              sx={{ 
                                bgcolor: alpha(theme.palette.success.main, 0.05),
                                borderRadius: 2,
                                p: 1
                              }}
                            >
                              {analysis.findings.normalStructures.map((item, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.75 }}>
                                  <ListItemText 
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                        <span>{item}</span>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {/* 异常发现 */}
                        {analysis.findings?.abnormalFindings && analysis.findings.abnormalFindings.length > 0 && (
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              gutterBottom
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'error.main',
                                fontWeight: 500,
                                mb: 1
                              }}
                            >
                              <ReportIcon sx={{ fontSize: 18, mr: 0.5 }} />
                              异常发现:
                            </Typography>
                            <List 
                              dense 
                              disablePadding
                              sx={{ 
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                                borderRadius: 2,
                                p: 1
                              }}
                            >
                              {analysis.findings.abnormalFindings.map((item, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.75 }}>
                                  <ListItemText 
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ReportIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                        <span>{item}</span>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {/* 无发现情况 */}
                        {(!analysis.findings?.normalStructures || analysis.findings.normalStructures.length === 0) && 
                         (!analysis.findings?.abnormalFindings || analysis.findings.abnormalFindings.length === 0) && (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              py: 4,
                              bgcolor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 2,
                            }}
                          >
                            <InfoOutlinedIcon sx={{ color: 'text.secondary', fontSize: 40, mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              没有详细的发现信息
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {/* 原始数据标签页 */}
                    {currentTab === 2 && rawContent && (
                      <Box sx={{ 
                        mt: 1, 
                        overflow: 'auto', 
                        maxHeight: '400px',
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderRadius: 2,
                        p: 2
                      }}>
                        <pre style={{ 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-word',
                          fontFamily: 'inherit',
                          fontSize: '0.875rem',
                          margin: 0
                        }}>
                          {rawContent}
                        </pre>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '250px',
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 2,
                      mt: 2
                    }}
                  >
                    <PsychologyIcon sx={{ color: 'text.secondary', fontSize: 50, mb: 2 }} />
                    <Typography sx={{ color: 'text.secondary' }}>
                      点击分析图像按钮开始分析
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </Paper>
        
        <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary', fontSize: '0.875rem' }}>
          医学影像诊断平台 &copy; {new Date().getFullYear()} | 结合多模态AI和YOLO技术
        </Box>
      </Container>
    </Box>
  );
}
