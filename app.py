from gradio import Interface
import subprocess
import os

def start_nextjs():
    # Next.js 서버 시작
    subprocess.Popen(["npm", "start"])
    return "Next.js 서버가 시작되었습니다. http://localhost:3000 에서 접속할 수 있습니다."

# Gradio 인터페이스 생성
iface = Interface(
    fn=start_nextjs,
    inputs=None,
    outputs="text",
    title="인센티브 시스템 데모",
    description="Next.js 기반의 인센티브 시스템 데모입니다. GraphQL API와 WebSocket을 통해 실시간 업데이트를 제공합니다."
)

# 서버 시작
if __name__ == "__main__":
    iface.launch() 