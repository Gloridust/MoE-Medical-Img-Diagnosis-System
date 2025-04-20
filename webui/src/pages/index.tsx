import { useState, useCallback, useEffect } from 'react';
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
  Tooltip,
  LinearProgress,
  useMediaQuery,
  IconButton,
  Fade
} from '@mui/material';
import Image from 'next/image';
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TouchAppIcon from '@mui/icons-material/TouchApp';

// 定义分析结果的接口
interface AnalysisResult {
  imageType?: string;
  bodyPart?: string;
  findings?: {
    normalStructures?: string[];
    abnormalFindings?: string[];
  };
  possibleDiagnosis?: Array<{
    diagnosis: string;
    confidence: string;
  }>;
  recommendedActions?: string[];
  severity?: string;
  confidence?: {
    overall: string;
    percentage: string;
    factors: string[];
  };
  summary?: string;
  rawText?: string;
}

// 定义严重程度类型
type SeverityColor = 'error' | 'warning' | 'success' | 'default';

// 置信度进度条组件
interface ConfidenceProgressProps {
  percentage: string;
  label?: string;
  showLabel?: boolean;
}

const ConfidenceProgress = ({ percentage, label, showLabel = true }: ConfidenceProgressProps) => {
  const theme = useTheme();
  // 从百分比字符串中提取数字
  const numericValue = parseInt(percentage.replace(/\D/g, ''), 10);
  const isValidNumber = !isNaN(numericValue) && numericValue >= 0 && numericValue <= 100;
  
  // 根据值选择颜色
  const getColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.info.main;
    if (value >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const color = isValidNumber ? getColor(numericValue) : theme.palette.grey[500];
  
  return (
    <Box sx={{ width: '100%', mb: showLabel ? 0 : 1 }}>
      {showLabel && label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 500, color }}>
            {percentage}
          </Typography>
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={isValidNumber ? numericValue : 0}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: alpha(color, 0.15),
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 3
          }
        }}
      />
    </Box>
  );
};

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [useYolo, setUseYolo] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTouchHint, setShowTouchHint] = useState(false);

  // 监听滚动位置以显示/隐藏回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 显示触摸提示（仅在移动设备上）
  useEffect(() => {
    if (isMobile && analysis) {
      setShowTouchHint(true);
      const timer = setTimeout(() => {
        setShowTouchHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [analysis, isMobile]);

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

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
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Avatar sx={{ mr: 2, bgcolor: alpha(theme.palette.common.white, 0.2) }}>
            <HealthAndSafetyIcon />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 500, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            医学影像诊断平台
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, flex: 1, px: { xs: 2, sm: 3 } }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3, 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            bgcolor: theme.palette.background.paper
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MedicalServicesIcon sx={{ color: 'primary.main', mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            <Typography variant="h5" gutterBottom sx={{ mb: 0, fontWeight: 500, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
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
              p: { xs: 2, sm: 4 },
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
                  width: { xs: 50, sm: 70 },
                  height: { xs: 50, sm: 70 },
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  mb: 2
                }}
              >
                <CloudUploadIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />
              </Avatar>
              {isDragActive ? (
                <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 500 }}>
                  释放文件开始上传...
                </Typography>
              ) : (
                <>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    点击或拖放医学影像图片到此处
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
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
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 0 },
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ScienceIcon sx={{ color: 'text.secondary', mr: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
              <FormControlLabel
                control={
                  <Switch 
                    checked={useYolo} 
                    onChange={(e) => setUseYolo(e.target.checked)} 
                    disabled={true}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>使用YOLO检测</Typography>
                    <Tooltip title="YOLO目标检测功能正在开发中，敬请期待">
                      <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                }
              />
            </Box>
            
            <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' } }}>
              {image && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={clearAll} 
                  sx={{ 
                    mr: 2,
                    borderRadius: 6,
                    px: { xs: 2, sm: 3 },
                    flex: { xs: 1, sm: 'none' },
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
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
                  px: { xs: 2, sm: 3 },
                  flex: { xs: 1, sm: 'none' },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
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
                '& .MuiAlert-icon': { alignItems: 'center' },
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
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
                  p: { xs: 1.5, sm: 2 },
                  flex: 1, 
                  maxWidth: { md: '40%' },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: 'hidden',
                  order: { xs: 2, md: 1 } // 移动端时图片放在下面
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
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
                  p: 1,
                  position: 'relative',
                  height: { xs: '250px', md: '400px' }
                }}>
                  {image && (
                    <Image 
                      src={`data:image/jpeg;base64,${image}`}
                      alt="医学影像" 
                      fill
                      style={{ 
                        objectFit: 'contain',
                        borderRadius: 8 
                      }}
                      unoptimized // 防止Next.js尝试优化数据URL
                    />
                  )}
                </Box>
              </Paper>
              
              {/* 分析结果 */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1.5, sm: 2 },
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  order: { xs: 1, md: 2 } // 移动端时结果放在上面
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
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
                    height: { xs: '200px', sm: '250px' },
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    mt: 2
                  }}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                            py: { xs: 1, sm: 1.5 },
                            minHeight: { xs: 40, sm: 48 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }
                        }}
                      >
                        <Tab label="概述" />
                        <Tab label="详细分析" />
                      </Tabs>
                    </Box>
                    
                    {/* 概述标签页 */}
                    {currentTab === 0 && (
                      <Box 
                        sx={{ 
                          px: { xs: 0.5, sm: 1 }, 
                          overflowY: 'auto', 
                          maxHeight: { xs: '350px', sm: 'none' },
                          scrollbarWidth: 'thin',
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: alpha(theme.palette.background.default, 0.5),
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: alpha(theme.palette.primary.main, 0.3),
                            borderRadius: 10,
                          },
                        }}
                      >
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            mb: 2, 
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            border: 'none'
                          }}
                        >
                          <CardContent sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                            {analysis.imageType && (
                              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>影像类型:</Box> {analysis.imageType} 
                                {analysis.bodyPart && (
                                  <> | <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>检查部位:</Box> {analysis.bodyPart}</>
                                )}
                              </Typography>
                            )}
                            <Typography variant="body1" component="div" sx={{ mb: 1, lineHeight: 1.6, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
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
                                  sx={{ borderRadius: 10, height: { xs: 24, sm: 32 }, '& .MuiChip-label': { fontSize: { xs: '0.7rem', sm: '0.75rem' } } }}
                                />
                              )}
                              {analysis.confidence?.overall && (
                                <Chip 
                                  label={`可信度: ${analysis.confidence.overall}`} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ borderRadius: 10, height: { xs: 24, sm: 32 }, '& .MuiChip-label': { fontSize: { xs: '0.7rem', sm: '0.75rem' } } }}
                                />
                              )}
                              {analysis.confidence?.percentage && (
                                <Chip 
                                  label={`置信度: ${analysis.confidence.percentage}`} 
                                  color="info"
                                  size="small" 
                                  variant="outlined"
                                  sx={{ borderRadius: 10, height: { xs: 24, sm: 32 }, '& .MuiChip-label': { fontSize: { xs: '0.7rem', sm: '0.75rem' } } }}
                                />
                              )}
                            </Box>
                            
                            {/* 置信度进度条 */}
                            {analysis.confidence?.percentage && (
                              <Box sx={{ mt: 2.5, mb: 1 }}>
                                <ConfidenceProgress
                                  percentage={analysis.confidence.percentage}
                                  label="总体诊断置信度"
                                />
                              </Box>
                            )}
                            
                            {/* 置信度因素 */}
                            {analysis.confidence?.factors && analysis.confidence.factors.length > 0 && (
                              <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha(theme.palette.info.light, 0.1), borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ display: 'block', color: 'info.main', fontWeight: 500, mb: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                  影响诊断可信度的因素:
                                </Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                  {analysis.confidence.factors.map((factor, idx) => (
                                    <Typography key={idx} component="li" variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                      {factor}
                                    </Typography>
                                  ))}
                                </Box>
                              </Box>
                            )}
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
                                mb: 1,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
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
                              {analysis.possibleDiagnosis.map((diagnosisItem, index) => (
                                <ListItem key={index} disablePadding sx={{ py: 0.75, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}>
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
                                        <Box sx={{ flex: 1, width: '100%' }}>
                                          <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: { xs: 0.5, sm: 0 }
                                          }}>
                                            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{diagnosisItem.diagnosis}</Typography>
                                            {diagnosisItem.confidence && (
                                              <Chip 
                                                label={diagnosisItem.confidence} 
                                                size="small"
                                                variant="outlined"
                                                color="info"
                                                sx={{ 
                                                  height: { xs: 18, sm: 20 }, 
                                                  '& .MuiChip-label': { 
                                                    px: 1,
                                                    fontSize: { xs: '0.65rem', sm: '0.7rem' }
                                                  },
                                                  borderRadius: 5
                                                }}
                                              />
                                            )}
                                          </Box>
                                          {diagnosisItem.confidence && (
                                            <Box sx={{ mt: 0.5, width: '100%' }}>
                                              <ConfidenceProgress
                                                percentage={diagnosisItem.confidence}
                                                showLabel={false}
                                              />
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    }
                                    sx={{ margin: 0 }}
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
                                mb: 1,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
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
                                        <Typography 
                                          variant="body2" 
                                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                          {action}
                                        </Typography>
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
                      <Box 
                        sx={{ 
                          px: { xs: 0.5, sm: 1 }, 
                          overflowY: 'auto', 
                          maxHeight: { xs: '350px', sm: 'none' },
                          scrollbarWidth: 'thin',
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: alpha(theme.palette.background.default, 0.5),
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: alpha(theme.palette.primary.main, 0.3),
                            borderRadius: 10,
                          },
                        }}
                      >
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
                                mb: 1,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: { xs: 16, sm: 18 }, mr: 0.5 }} />
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
                                        <CheckCircleIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'success.main' }} />
                                        <Typography 
                                          variant="body2" 
                                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                          {item}
                                        </Typography>
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
                                mb: 1,
                                fontSize: { xs: '0.8rem', sm: '0.875rem' }
                              }}
                            >
                              <ReportIcon sx={{ fontSize: { xs: 16, sm: 18 }, mr: 0.5 }} />
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
                                        <ReportIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: 'error.main' }} />
                                        <Typography 
                                          variant="body2" 
                                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                          {item}
                                        </Typography>
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
                              py: { xs: 3, sm: 4 },
                              bgcolor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 2,
                            }}
                          >
                            <InfoOutlinedIcon sx={{ color: 'text.secondary', fontSize: { xs: 32, sm: 40 }, mb: 2 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                              没有详细的发现信息
                            </Typography>
                          </Box>
                        )}
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
                      height: { xs: '200px', sm: '250px' },
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 2,
                      mt: 2
                    }}
                  >
                    <PsychologyIcon sx={{ color: 'text.secondary', fontSize: { xs: 40, sm: 50 }, mb: 2 }} />
                    <Typography sx={{ color: 'text.secondary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      点击分析图像按钮开始分析
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </Paper>
        
        <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 4 }, color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' }, pb: 2 }}>
          <Box sx={{ maxWidth: '260px', mx: 'auto', px: 2 }}>
            医学影像诊断平台 &copy; {new Date().getFullYear()} | 结合多模态AI和YOLO技术
          </Box>
        </Box>
      </Container>

      {/* 返回顶部按钮 */}
      <Fade in={showScrollTop}>
        <IconButton
          color="primary"
          aria-label="返回顶部"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: alpha(theme.palette.primary.main, 0.9),
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.main,
            },
            zIndex: 10,
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      </Fade>

      {/* 移动端滑动提示 */}
      <Fade in={showTouchHint}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: alpha(theme.palette.info.main, 0.9),
            color: 'white',
            py: 1,
            px: 2,
            borderRadius: 10,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <TouchAppIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          <Typography variant="caption">
            上下滑动查看更多内容
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
}
