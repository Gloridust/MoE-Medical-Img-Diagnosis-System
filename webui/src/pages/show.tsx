import React from 'react';
import {
  Box,
  Stack,
  Container,
  Paper,
  Typography,
  Chip,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import Image from 'next/image';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

// 模拟患者数据
const patientData = {
  id: 'P20230512001',
  name: '张明',
  age: 58,
  gender: '男',
  idCard: '3102********1234',
  phone: '138****5678',
  emergencyContact: '李华 (妻子) 139****1234',
  address: '上海市浦东新区张江高科技园区科苑路88号',
  checkInDate: '2023-05-12',
  department: '放射科',
  checkupTime: '2023-05-12 09:15',
  doctorName: '王医生',
  medicalHistory: [
    { date: '2018-03', description: '高血压，开始服用降压药物' },
    { date: '2020-09', description: '慢性支气管炎，住院治疗一周' },
    { date: '2022-11', description: '右肺部异常阴影，建议定期复查' }
  ],
  allergies: ['青霉素', '海鲜'],
  medications: [
    { name: '苯磺酸氨氯地平片', dosage: '5mg', frequency: '每日一次' },
    { name: '沙丁胺醇气雾剂', dosage: '100μg', frequency: '需要时使用' }
  ],
  imagingInfo: {
    type: '胸部CT平扫',
    date: '2023-05-12',
    equipmentModel: 'Siemens SOMATOM',
    imageUrl: '/images/ct-demo.jpg',
    description: '在右肺上叶见到约2.7cm大小的类圆形软组织密度影，边缘略不规则，内部密度不均匀'
  },
  aiAnalysis: {
    summary: '右肺上叶疑似肿块，高度怀疑为肺癌，建议进一步活检确诊',
    findings: [
      { area: '右肺上叶', finding: '2.7cm类圆形软组织密度影，边缘不规则', severity: 'high' },
      { area: '纵隔', finding: '未见明显淋巴结肿大', severity: 'normal' },
      { area: '左肺', finding: '未见明显异常', severity: 'normal' },
      { area: '胸膜', finding: '局部轻微增厚', severity: 'low' }
    ],
    diagnosis: [
      { name: '肺癌', probability: 0.85, description: '基于影像特征，高度怀疑为肺癌' },
      { name: '炎性假瘤', probability: 0.12, description: '可能性较低，但不能完全排除' },
      { name: '肺结核', probability: 0.03, description: '可能性低' }
    ],
    recommendations: [
      '建议进行CT引导下经皮肺穿刺活检',
      '完善肿瘤标志物等相关检查',
      '考虑PET-CT检查，评估全身情况',
      '多学科会诊，制定个体化治疗方案'
    ]
  }
};

// 置信度进度条组件
interface ConfidenceBarProps {
  value: number;
  label: string;
}

const ConfidenceBar = ({ value, label }: ConfidenceBarProps) => {
  const theme = useTheme();
  
  // 根据概率值选择颜色
  const getColor = (probability: number) => {
    if (probability >= 0.7) return theme.palette.error.main;
    if (probability >= 0.4) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const color = getColor(value);
  
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#f0f0f0' }}>
          {label}
        </Typography>
        <Typography variant="body2" color={color} sx={{ fontWeight: 600 }}>
          {Math.round(value * 100)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value * 100}
        sx={{
          height: 10,
          borderRadius: 5,
          bgcolor: alpha(color, 0.15),
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 5
          }
        }}
      />
    </Box>
  );
};

// 获取严重程度图标
const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <ErrorIcon color="error" />;
    case 'low':
      return <WarningIcon color="warning" />;
    case 'normal':
      return <CheckCircleIcon color="success" />;
    default:
      return <CheckCircleIcon color="success" />;
  }
};

export default function PatientDashboard() {
  return (
    <Box sx={{ 
      bgcolor: '#0c1620', 
      minHeight: '100vh',
      p: 3,
      color: '#f0f0f0'
    }}>
      <Container maxWidth="xl" sx={{ 
        margin: '0 auto',
      }}>
        {/* 标题区域 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <MedicalServicesIcon sx={{ fontSize: 36, mr: 2, color: '#60a5fa' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flexGrow: 1, color: '#ffffff' }}>
            医学影像AI辅助诊断系统 - 患者报告
          </Typography>
          <Chip 
            label={patientData.id} 
            color="primary" 
            sx={{ fontSize: '1rem', height: 36, px: 1 }}
          />
        </Box>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
          {/* 患者基本信息 */}
          <Paper sx={{ p: 3, bgcolor: alpha('#1e293b', 0.9), borderRadius: 2, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56, mr: 2 }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  {patientData.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#cbd5e1' }}>
                  {patientData.gender} | {patientData.age}岁
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2, borderColor: alpha('#ffffff', 0.1) }} />
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  身份证号
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: '#e2e8f0' }}>
                  {patientData.idCard}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  联系电话
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: '#e2e8f0' }}>
                  {patientData.phone}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  紧急联系人
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: '#e2e8f0' }}>
                  {patientData.emergencyContact}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  住址
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: '#e2e8f0' }}>
                  {patientData.address}
                </Typography>
              </Box>
            </Stack>
            
            <Divider sx={{ my: 2, borderColor: alpha('#ffffff', 0.1) }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarTodayIcon sx={{ mr: 1, color: '#60a5fa' }} />
              <Typography variant="body1" sx={{ color: '#e2e8f0' }}>
                检查日期: {patientData.checkupTime}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalHospitalIcon sx={{ mr: 1, color: '#60a5fa' }} />
              <Typography variant="body1" sx={{ color: '#e2e8f0' }}>
                科室: {patientData.department}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1, color: '#60a5fa' }} />
              <Typography variant="body1" sx={{ color: '#e2e8f0' }}>
                主治医师: {patientData.doctorName}
              </Typography>
            </Box>
          </Paper>
          
          {/* 医疗影像和描述 */}
          <Paper sx={{ p: 3, bgcolor: alpha('#1e293b', 0.9), borderRadius: 2, flex: 2 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', color: '#ffffff' }}>
              <Box component="span" sx={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', bgcolor: '#3b82f6', mr: 1 }} />
              医学影像 - {patientData.imagingInfo.type}
            </Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 3 }}>
                <Box sx={{ position: 'relative', width: '100%', height: 400, bgcolor: '#000', borderRadius: 2, overflow: 'hidden' }}>
                  <Image 
                    src={patientData.imagingInfo.imageUrl}
                    alt="CT影像"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ flex: 2 }}>
                <Card sx={{ bgcolor: alpha('#334155', 0.7), height: '100%', borderRadius: 2, border: `1px solid ${alpha('#ffffff', 0.1)}` }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#ffffff' }}>
                      影像描述
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6, color: '#e2e8f0' }}>
                      {patientData.imagingInfo.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2, borderColor: alpha('#ffffff', 0.1) }} />
                    
                    <Typography variant="subtitle2" sx={{ color: '#94a3b8' }} gutterBottom>
                      检查信息
                    </Typography>
                    
                    <TableContainer component={Box}>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#94a3b8', pl: 0 }}>检查类型</TableCell>
                            <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#e2e8f0' }}>{patientData.imagingInfo.type}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#94a3b8', pl: 0 }}>检查日期</TableCell>
                            <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#e2e8f0' }}>{patientData.imagingInfo.date}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#94a3b8', pl: 0 }}>设备型号</TableCell>
                            <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#e2e8f0' }}>{patientData.imagingInfo.equipmentModel}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Paper>
        </Stack>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* 医疗历史 */}
          <Paper sx={{ p: 3, bgcolor: alpha('#1e293b', 0.9), borderRadius: 2, flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', color: '#ffffff' }}>
              <Box component="span" sx={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', bgcolor: '#f59e0b', mr: 1 }} />
              病史记录
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ position: 'relative', pl: 3, mb: 3 }}>
                <Box sx={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: 0, 
                  bottom: 0, 
                  width: 2, 
                  bgcolor: alpha('#38bdf8', 0.4) 
                }} />
                
                {patientData.medicalHistory.map((history, index) => (
                  <Box key={index} sx={{ position: 'relative', mb: 3, pb: 2 }}>
                    <Box sx={{ 
                      position: 'absolute', 
                      left: -14, 
                      top: 0, 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: '#38bdf8',
                      zIndex: 1
                    }} />
                    
                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: '#38bdf8' }}>
                      {history.date}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                      {history.description}
                    </Typography>
                    
                    {index < patientData.medicalHistory.length - 1 && (
                      <Box sx={{ 
                        position: 'absolute',
                        left: -10,
                        bottom: 0,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: alpha('#38bdf8', 0.5)
                      }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Divider sx={{ my: 2, borderColor: alpha('#ffffff', 0.1) }} />
            
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#ffffff' }}>
              过敏史
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {patientData.allergies.map((allergy, index) => (
                <Chip 
                  key={index}
                  label={allergy}
                  color="error"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
            
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#ffffff' }}>
              现用药物
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), fontWeight: 500, color: '#ffffff' }}>药物名称</TableCell>
                    <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), fontWeight: 500, color: '#ffffff' }}>剂量</TableCell>
                    <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), fontWeight: 500, color: '#ffffff' }}>频次</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patientData.medications.map((medication, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#e2e8f0' }}>{medication.name}</TableCell>
                      <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#e2e8f0' }}>{medication.dosage}</TableCell>
                      <TableCell sx={{ borderColor: alpha('#ffffff', 0.1), color: '#e2e8f0' }}>{medication.frequency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
          {/* AI分析结果 */}
          <Paper sx={{ p: 3, bgcolor: alpha('#1e293b', 0.9), borderRadius: 2, flex: 2 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', color: '#ffffff' }}>
              <Box component="span" sx={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', bgcolor: '#ef4444', mr: 1 }} />
              AI分析结果
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: '#f87171' }}>
              {patientData.aiAnalysis.summary}
            </Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: alpha('#334155', 0.7), height: '100%', borderRadius: 2, border: `1px solid ${alpha('#ffffff', 0.1)}` }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#ffffff' }}>
                      影像发现
                    </Typography>
                    
                    <List disablePadding>
                      {patientData.aiAnalysis.findings.map((finding, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {getSeverityIcon(finding.severity)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#f0f0f0' }}>
                                {finding.area}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                                {finding.finding}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Card sx={{ bgcolor: alpha('#334155', 0.7), height: '100%', borderRadius: 2, border: `1px solid ${alpha('#ffffff', 0.1)}` }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#ffffff' }}>
                      可能诊断
                    </Typography>
                    
                    {patientData.aiAnalysis.diagnosis.map((diagnosis, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <ConfidenceBar 
                          value={diagnosis.probability} 
                          label={diagnosis.name} 
                        />
                        <Typography variant="body2" sx={{ ml: 1, color: '#cbd5e1' }}>
                          {diagnosis.description}
                        </Typography>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 2, borderColor: alpha('#ffffff', 0.1) }} />
                    
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#ffffff' }}>
                      建议
                    </Typography>
                    
                    <List dense disablePadding>
                      {patientData.aiAnalysis.recommendations.map((recommendation, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                          <Box 
                            component="span" 
                            sx={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: alpha('#3b82f6', 0.2),
                              color: '#60a5fa',
                              mr: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                            {recommendation}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Paper>
        </Stack>
        
        {/* 页脚 */}
        <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.7 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            © {new Date().getFullYear()} 医学影像AI辅助诊断系统 | 报告生成时间: {new Date().toLocaleString()}
          </Typography>
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#94a3b8' }}>
            注意：AI辅助诊断仅供参考，最终诊断请以专业医师意见为准
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 