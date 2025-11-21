import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Grid,
  useToast,
  Spinner,
  Center,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { FiTarget, FiTrendingUp, FiAward, FiRefreshCw } from 'react-icons/fi';
import recommendationsService from '../services/recommendations';

const Recommendations = () => {
  const toast = useToast();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationsService.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      toast({
        title: 'おすすめ読み込みエラー',
        description: error.response?.data?.detail || 'おすすめの読み込みに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    try {
      setGenerating(true);
      await recommendationsService.generateRecommendations();
      toast({
        title: 'おすすめを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadRecommendations();
    } catch (error) {
      toast({
        title: 'おすすめ生成エラー',
        description: error.response?.data?.detail || 'おすすめの生成に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={{ base: 4, md: 6, lg: 8 }} display="flex" flexDirection={{ base: "column", sm: "row" }} justifyContent="space-between" alignItems={{ base: "flex-start", sm: "center" }} gap={{ base: 3, sm: 0 }}>
        <Box>
          <Heading size={{ base: "sm", md: "md" }} mb={2}>AIおすすめ</Heading>
          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">あなたのフィットネスジャーニーに合わせたパーソナライズされた提案</Text>
        </Box>
        <Button
          colorScheme="brand"
          leftIcon={<FiRefreshCw />}
          onClick={generateNewRecommendations}
          isLoading={generating}
          size={{ base: "sm", md: "md" }}
          w={{ base: "full", sm: "auto" }}
        >
          更新
        </Button>
      </Box>

      <Tabs colorScheme="brand">
        <TabList>
          <Tab>概要</Tab>
          <Tab>ワークアウトプラン</Tab>
          <Tab>食事プラン</Tab>
          <Tab>ヒント＆インサイト</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={{ base: 3, md: 4, lg: 6 }}>
              {/* Current Status */}
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={FiTarget} color="brand.500" boxSize={6} />
                    <Heading size="md">現在の状態</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text fontWeight="medium" mb={2}>フィットネスレベル</Text>
                      <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                        {recommendations?.fitness_level || '中級'}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" mb={2}>主な目標</Text>
                      <Text color="gray.600">{recommendations?.primary_goal || '減量'}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" mb={2}>進捗率</Text>
                      <HStack>
                        <Icon as={FiTrendingUp} color="green.500" />
                        <Text color="green.600" fontWeight="medium">
                          {recommendations?.progress_rate || '順調'}
                        </Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontWeight="medium" mb={2}>継続スコア</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                        {recommendations?.consistency_score || 85}%
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Key Recommendations */}
              <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack>
                    <Icon as={FiAward} color="purple.500" boxSize={6} />
                    <Heading size="md">重要なおすすめ</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    {recommendations?.key_recommendations?.map((rec, index) => (
                      <Box key={index} p={3} bg="purple.50" borderRadius="md" borderLeft="4px" borderColor="purple.500">
                        <Text fontWeight="medium" mb={1}>{rec.title}</Text>
                        <Text fontSize="sm" color="gray.600">{rec.description}</Text>
                      </Box>
                    )) || (
                      <>
                        <Box p={3} bg="purple.50" borderRadius="md" borderLeft="4px" borderColor="purple.500">
                          <Text fontWeight="medium" mb={1}>タンパク質摂取を増やす</Text>
                          <Text fontSize="sm" color="gray.600">
                            筋肉成長をサポートするため、体重1kgあたり1.6-2.2gを目標に
                          </Text>
                        </Box>
                        <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="blue.500">
                          <Text fontWeight="medium" mb={1}>有酸素運動を追加</Text>
                          <Text fontSize="sm" color="gray.600">
                            より効果的な脂肪燃焼のため、週2-3回の有酸素運動を含める
                          </Text>
                        </Box>
                        <Box p={3} bg="green.50" borderRadius="md" borderLeft="4px" borderColor="green.500">
                          <Text fontWeight="medium" mb={1}>睡眠の質を改善</Text>
                          <Text fontSize="sm" color="gray.600">
                            最適な回復のため、7-9時間の質の高い睡眠を目指す
                          </Text>
                        </Box>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </Grid>

            {/* Weekly Focus */}
            <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} mt={6}>
              <CardHeader>
                <Heading size="md">今週の重点項目</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                  <Box>
                    <Text fontWeight="medium" mb={2} color="brand.600">栄養</Text>
                    <Text fontSize="sm" color="gray.600">
                      {recommendations?.weekly_focus?.nutrition || '毎日のタンパク質目標を達成することに集中。すべての食事を一貫して記録。'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2} color="purple.600">ワークアウト</Text>
                    <Text fontSize="sm" color="gray.600">
                      {recommendations?.weekly_focus?.workouts || '4回の筋力トレーニングセッションを完了。プログレッシブオーバーロードに集中。'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2} color="green.600">回復</Text>
                    <Text fontSize="sm" color="gray.600">
                      {recommendations?.weekly_focus?.recovery || '睡眠とアクティブリカバリーを優先。一日中水分補給を維持。'}
                    </Text>
                  </Box>
                </Grid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Workout Plans Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {recommendations?.workout_plans?.map((plan, index) => (
                <Card key={index} bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">{plan.name}</Heading>
                    <Badge colorScheme="brand" mt={2}>{plan.difficulty}</Badge>
                  </CardHeader>
                  <CardBody>
                    <Text color="gray.600" mb={4}>{plan.description}</Text>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">期間:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.duration}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">頻度:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.frequency}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">重点:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.focus}</Text>
                      </HStack>
                    </VStack>
                    <Button colorScheme="brand" size="sm" mt={4} w="full">
                      このプランを開始
                    </Button>
                  </CardBody>
                </Card>
              )) || (
                <>
                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">筋力向上プログラム</Heading>
                      <Badge colorScheme="brand" mt={2}>中級</Badge>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600" mb={4}>
                        コンパウンド種目とプログレッシブオーバーロードに焦点を当てた4日間スプリット
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">期間:</Text>
                          <Text fontSize="sm" fontWeight="medium">12週間</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">頻度:</Text>
                          <Text fontSize="sm" fontWeight="medium">週4日</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">重点:</Text>
                          <Text fontSize="sm" fontWeight="medium">筋肉増強</Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="brand" size="sm" mt={4} w="full">
                        このプランを開始
                      </Button>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">脂肪燃焼サーキットトレーニング</Heading>
                      <Badge colorScheme="orange" mt={2}>初級-中級</Badge>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600" mb={4}>
                        最大カロリー消費のための有酸素運動と筋力トレーニングを組み合わせた高強度サーキット
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">期間:</Text>
                          <Text fontSize="sm" fontWeight="medium">8週間</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">頻度:</Text>
                          <Text fontSize="sm" fontWeight="medium">週5日</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">重点:</Text>
                          <Text fontSize="sm" fontWeight="medium">脂肪燃焼</Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="brand" size="sm" mt={4} w="full">
                        このプランを開始
                      </Button>
                    </CardBody>
                  </Card>
                </>
              )}
            </Grid>
          </TabPanel>

          {/* Meal Plans Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {recommendations?.meal_plans?.map((plan, index) => (
                <Card key={index} bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">{plan.name}</Heading>
                    <Badge colorScheme="green" mt={2}>{plan.calories} kcal/日</Badge>
                  </CardHeader>
                  <CardBody>
                    <Text color="gray.600" mb={4}>{plan.description}</Text>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">タンパク質:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.protein}g</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">炭水化物:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.carbs}g</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">脂質:</Text>
                        <Text fontSize="sm" fontWeight="medium">{plan.fats}g</Text>
                      </HStack>
                    </VStack>
                    <Button colorScheme="green" size="sm" mt={4} w="full">
                      食事プランを表示
                    </Button>
                  </CardBody>
                </Card>
              )) || (
                <>
                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">バランス栄養プラン</Heading>
                      <Badge colorScheme="green" mt={2}>2,200 kcal/日</Badge>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600" mb={4}>
                        持続可能な減量と筋肉維持のためのバランスの取れたマクロ栄養素
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">タンパク質:</Text>
                          <Text fontSize="sm" fontWeight="medium">165g (30%)</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">炭水化物:</Text>
                          <Text fontSize="sm" fontWeight="medium">220g (40%)</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">脂質:</Text>
                          <Text fontSize="sm" fontWeight="medium">73g (30%)</Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="green" size="sm" mt={4} w="full">
                        食事プランを表示
                      </Button>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">高タンパク質プラン</Heading>
                      <Badge colorScheme="blue" mt={2}>2,400 kcal/日</Badge>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600" mb={4}>
                        筋肉増強と回復をサポートする高タンパク質摂取
                      </Text>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">タンパク質:</Text>
                          <Text fontSize="sm" fontWeight="medium">210g (35%)</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">炭水化物:</Text>
                          <Text fontSize="sm" fontWeight="medium">240g (40%)</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">脂質:</Text>
                          <Text fontSize="sm" fontWeight="medium">67g (25%)</Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="green" size="sm" mt={4} w="full">
                        食事プランを表示
                      </Button>
                    </CardBody>
                  </Card>
                </>
              )}
            </Grid>
          </TabPanel>

          {/* Tips & Insights Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {recommendations?.tips?.map((tip, index) => (
                <Card key={index} bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <HStack align="start" spacing={4}>
                      <Icon as={FiAward} color="brand.500" boxSize={6} mt={1} />
                      <Box flex="1">
                        <Heading size="sm" mb={2}>{tip.title}</Heading>
                        <Text color="gray.600" fontSize="sm">{tip.content}</Text>
                        <Badge colorScheme="brand" mt={2}>{tip.category}</Badge>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              )) || (
                <>
                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack align="start" spacing={4}>
                        <Icon as={FiAward} color="brand.500" boxSize={6} mt={1} />
                        <Box flex="1">
                          <Heading size="sm" mb={2}>プログレッシブオーバーロードが鍵</Heading>
                          <Text color="gray.600" fontSize="sm">
                            筋力トレーニングルーチンで、重量、頻度、または反復回数を徐々に増やしましょう。このプログレッシブオーバーロードは、継続的な筋肉成長と筋力向上に不可欠です。
                          </Text>
                          <Badge colorScheme="brand" mt={2}>ワークアウト</Badge>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack align="start" spacing={4}>
                        <Icon as={FiAward} color="green.500" boxSize={6} mt={1} />
                        <Box flex="1">
                          <Heading size="sm" mb={2}>食事のタイミングが重要</Heading>
                          <Text color="gray.600" fontSize="sm">
                            筋タンパク質合成を最大化するため、ワークアウト後2時間以内にタンパク質を摂取しましょう。ワークアウト後は20-40gの高品質タンパク質を目指しましょう。
                          </Text>
                          <Badge colorScheme="green" mt={2}>栄養</Badge>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack align="start" spacing={4}>
                        <Icon as={FiAward} color="purple.500" boxSize={6} mt={1} />
                        <Box flex="1">
                          <Heading size="sm" mb={2}>回復もトレーニングの一部</Heading>
                          <Text color="gray.600" fontSize="sm">
                            筋肉はワークアウト中ではなく、休息中に成長します。7-9時間の質の高い睡眠を確保し、週に少なくとも1-2日の休息日を取りましょう。
                          </Text>
                          <Badge colorScheme="purple" mt={2}>回復</Badge>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack align="start" spacing={4}>
                        <Icon as={FiAward} color="orange.500" boxSize={6} mt={1} />
                        <Box flex="1">
                          <Heading size="sm" mb={2}>水分補給を維持</Heading>
                          <Text color="gray.600" fontSize="sm">
                            毎日少なくとも3-4リットルの水を飲みましょう。適切な水分補給はパフォーマンスを向上させ、回復を助け、代謝プロセスをサポートします。
                          </Text>
                          <Badge colorScheme="orange" mt={2}>一般</Badge>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                </>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Recommendations;
