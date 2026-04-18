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
            env.NODE_CMD = "${env.NODE_HOME}/bin/node"
            env.NPM_CMD = "${env.NODE_HOME}/bin/npm"

            sh """
              set -eu

              if [ ! -x "${env.NODE_HOME}/bin/npm" ]; then
                ARCHIVE="node-v${env.NODE_VERSION}-linux-x64.tar.gz"
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

                if ! tar -xzf "\$CACHE_DIR/\$ARCHIVE" -C "\$EXTRACT_DIR"; then
                  echo "Unable to extract Node.js archive with gzip support."
                  exit 1
                fi

                mv "\$SOURCE_DIR" "${env.NODE_HOME}"
              fi

              export PATH="${env.NODE_HOME}/bin:\$PATH"
              "${env.NODE_CMD}" --version
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
            sh 'PATH="${NODE_HOME}/bin:$PATH" "${NPM_CMD}" ci'
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
            sh 'PATH="${NODE_HOME}/bin:$PATH" "${NPM_CMD}" run lint'
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
            ? "PATH=\"${env.NODE_HOME}/bin:\$PATH\" \"${env.NPM_CMD}\" run build:${params.TARGET_ENV}"
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
