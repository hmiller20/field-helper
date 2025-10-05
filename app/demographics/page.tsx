'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { getProgressValue } from '../utils/sessionProgress';
import { updateSession, getCurrentSession, addCompletedSession } from '../utils/sessionData';

export default function Demographics() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    previousParticipation: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleNumberPadClick = (num: string) => {
    if (num === 'clear') {
      setFormData(prev => ({ ...prev, age: '' }));
    } else if (num === 'backspace') {
      setFormData(prev => ({ ...prev, age: prev.age.slice(0, -1) }));
    } else {
      // Limit age to 3 digits (up to 999)
      if (formData.age.length < 3) {
        setFormData(prev => ({ ...prev, age: prev.age + num }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validation: require all fields
      if (!formData.age || !formData.gender || !formData.previousParticipation) {
        setError('Please answer all questions before continuing.');
        return;
      }

      // Validate age range
      const ageNum = parseInt(formData.age);
      if (ageNum < 18 || ageNum > 120) {
        setError('Please enter an age between 18 and 120.');
        return;
      }

      console.log('Demographics submitted:', formData);

      const session = getCurrentSession();
      if (!session) {
        console.error('No current session found');
        router.push('/consent');
        return;
      }

      // Always update the current session first to make sure that all data is preserved
      updateSession({
        demographics: {
          age: formData.age,
          gender: formData.gender,
          previousParticipation: formData.previousParticipation
        }
      });

      // Use local session data to avoid Firefox race condition
      // Don't call getCurrentSession() again - use the session we already have
      const finalSession = {
        ...session,
        demographics: {
          age: formData.age,
          gender: formData.gender,
          previousParticipation: formData.previousParticipation
        }
      };

      console.log('=== DEMOGRAPHICS: Final session data ===');
      console.log('Session ID:', finalSession.id);
      console.log('Blocks completed:', finalSession.blocks?.length);
      console.log('Demographics:', finalSession.demographics);

      // Check if this is a complete session (has all 3 blocks)
      // Use local session data to check completion
      const hasBaseline = !!finalSession.baselineDrawing;
      const completedBlockTypes = finalSession.blocks?.map(b => b.blockType) || [];
      const requiredBlocks: Array<'prestige' | 'dominance' | 'lowStatus'> = ['prestige', 'dominance', 'lowStatus'];
      const isComplete = hasBaseline && requiredBlocks.every(blockType => completedBlockTypes.includes(blockType));

      if (isComplete) {
        console.log('Session is complete, adding to completed sessions');
        const success = addCompletedSession(finalSession);
        if (!success) {
          console.error('Failed to save completed session, but continuing to debriefing');
          // Still navigate even if save failed - the session data is already in localStorage
        }
      } else {
        console.warn('Session is incomplete - not adding to completed sessions');
        console.log('Has baseline:', hasBaseline);
        console.log('Completed blocks:', completedBlockTypes);
      }

      // Always navigate to debriefing page regardless of errors
      router.push('/debriefing');
    } catch (error) {
      console.error('Error in demographics handleSubmit:', error);
      // Navigate anyway to avoid getting stuck
      setError('An error occurred, but continuing...');
      setTimeout(() => {
        router.push('/debriefing');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={getProgressValue('demographics')} className="w-full h-2" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            Progress: {getProgressValue('demographics')}%
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Age Number Pad */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Use the number pad to select your age.</Label>
                
                {/* Age Display */}
                <div className="flex justify-center">
                  <div className="text-3xl font-bold bg-gray-100 border-2 border-gray-300 rounded px-6 py-3 min-w-[100px] text-center">
                    {formData.age || '---'}
                  </div>
                </div>
                
                {/* Number Pad */}
                <div className="flex flex-col items-center space-y-3">
                  {/* Numbers 1-9 */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleNumberPadClick(num.toString())}
                        className="w-16 h-16 bg-white border-2 border-gray-300 hover:border-gray-400 rounded text-xl font-semibold transition-colors"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  
                  {/* Bottom row: Clear, 0, Backspace */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleNumberPadClick('clear')}
                      className="w-16 h-16 bg-red-100 border-2 border-red-300 hover:border-red-400 rounded text-sm font-semibold transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberPadClick('0')}
                      className="w-16 h-16 bg-white border-2 border-gray-300 hover:border-gray-400 rounded text-xl font-semibold transition-colors"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNumberPadClick('backspace')}
                      className="w-16 h-16 bg-yellow-100 border-2 border-yellow-300 hover:border-yellow-400 rounded text-sm font-semibold transition-colors"
                    >
                      ⌫
                    </button>
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Gender</Label>
                <div className="space-y-3">
                  {/* First row - 3 options */}
                  <div className="grid grid-cols-3 gap-4">
                    {['Man', 'Woman', 'Non-binary'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: option }))}
                        className={`px-4 py-3 rounded-lg border-2 font-medium text-base transition-all duration-200 ${
                          formData.gender === option
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-blue-500 text-black hover:bg-blue-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  {/* Second row - 2 options */}
                  <div className="grid grid-cols-2 gap-4">
                    {['Prefer not to say', 'Other'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: option }))}
                        className={`px-4 py-3 rounded-lg border-2 font-medium text-base transition-all duration-200 ${
                          formData.gender === option
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-blue-500 text-black hover:bg-blue-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Previous Participation */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Have you participated in this study before? You can receive candy no matter your answer.</Label>
                <div className="grid grid-cols-2 gap-4">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, previousParticipation: option }))}
                      className={`px-4 py-3 rounded-lg border-2 font-medium text-base transition-all duration-200 ${
                        formData.previousParticipation === option
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-blue-500 text-black hover:bg-blue-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-center text-sm font-medium">{error}</div>
              )}

              <div className="flex justify-center pt-4">
                <Button type="submit" className="w-full max-w-md">
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
