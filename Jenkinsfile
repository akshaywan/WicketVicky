pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    NODE_VERSION = '20.19.0'
  }

  parameters {
    choice(
      name: 'TARGET_ENV',
      choices: ['dev', 'qa', 'prod'],
      description: 'Select which frontend environment to build.',
    )
  }

  stages {
    stage('Prepare') {
      steps {
        script {
          currentBuild.displayName = "#${env.BUILD_NUMBER} ${params.TARGET_ENV}"

          if (isUnix()) {
            env.WORKSPACE_ROOT = pwd()
            env.NODE_HOME = "${env.WORKSPACE_ROOT}/.jenkins/node-v${env.NODE_VERSION}"
            env.NPM_CMD = "${env.NODE_HOME}/bin/npm"

            sh """
              set -eu

              if [ ! -x "${env.NODE_HOME}/bin/npm" ]; then
                ARCHIVE="node-v${env.NODE_VERSION}-linux-x64.tar.xz"
                URL="https://nodejs.org/dist/v${env.NODE_VERSION}/\$ARCHIVE"
                CACHE_DIR="${env.WORKSPACE_ROOT}/.jenkins/cache"
                EXTRACT_DIR="${env.WORKSPACE_ROOT}/.jenkins"
                SOURCE_DIR="\$EXTRACT_DIR/node-v${env.NODE_VERSION}-linux-x64"

                mkdir -p "\$CACHE_DIR" "\$EXTRACT_DIR"

                if [ ! -f "\$CACHE_DIR/\$ARCHIVE" ]; then
                  if command -v curl >/dev/null 2>&1; then
                    curl -fsSL "\$URL" -o "\$CACHE_DIR/\$ARCHIVE"
                  elif command -v wget >/dev/null 2>&1; then
                    wget -qO "\$CACHE_DIR/\$ARCHIVE" "\$URL"
                  else
                    echo "Neither curl nor wget is available to download Node.js."
                    exit 1
                  fi
                fi

                rm -rf "\$SOURCE_DIR"

                if tar -xJf "\$CACHE_DIR/\$ARCHIVE" -C "\$EXTRACT_DIR" 2>/dev/null; then
                  :
                elif command -v python3 >/dev/null 2>&1; then
                  python3 - <<PY
import tarfile

archive = r"${env.WORKSPACE_ROOT}/.jenkins/cache/node-v${env.NODE_VERSION}-linux-x64.tar.xz"
target = r"${env.WORKSPACE_ROOT}/.jenkins"

with tarfile.open(archive, mode="r:xz") as tar:
    tar.extractall(path=target)
PY
                else
                  echo "Unable to extract Node.js archive: tar lacks xz support and python3 is unavailable."
                  exit 1
                fi

                mv "\$SOURCE_DIR" "${env.NODE_HOME}"
              fi

              "${env.NPM_CMD}" --version
            """
          } else {
            env.NPM_CMD = 'npm'
          }
        }
      }
    }

    stage('Install') {
      steps {
        script {
          if (isUnix()) {
            sh '"${NPM_CMD}" ci'
          } else {
            bat '%NPM_CMD% ci'
          }
        }
      }
    }

    stage('Lint') {
      steps {
        script {
          if (isUnix()) {
            sh '"${NPM_CMD}" run lint'
          } else {
            bat '%NPM_CMD% run lint'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          def buildCommand = isUnix()
            ? "\"${env.NPM_CMD}\" run build:${params.TARGET_ENV}"
            : "%NPM_CMD% run build:${params.TARGET_ENV}"

          if (isUnix()) {
            sh buildCommand
          } else {
            bat buildCommand
          }
        }
      }
    }
  }

  post {
    success {
      archiveArtifacts artifacts: 'apps/web/dist/**', fingerprint: true
    }

    always {
      script {
        if (fileExists('apps/web/dist')) {
          if (isUnix()) {
            sh 'ls -la apps/web/dist'
          } else {
            bat 'dir apps\\web\\dist'
          }
        }
      }
    }
  }
}
