pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    NODE_VERSION   = '20.19.0'
    RAILWAY_TOKEN  = credentials('railway-token')
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
            env.NODE_HOME      = "${env.WORKSPACE_ROOT}/.jenkins/node-v${env.NODE_VERSION}"
            env.NODE_CMD       = "${env.NODE_HOME}/bin/node"
            env.NPM_CMD        = "${env.NODE_HOME}/bin/npm"

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

    stage('Deploy') {
      steps {
        script {
          if (isUnix()) {
            sh """
              set -eu
              export PATH="${env.NODE_HOME}/bin:\$PATH"

              # ── Install Railway CLI (pinned, skipped if already present) ──────
              RAILWAY_BIN="${env.WORKSPACE_ROOT}/.jenkins/railway"

              if [ ! -x "\$RAILWAY_BIN" ]; then
                echo "Installing Railway CLI..."
                curl -fsSL https://raw.githubusercontent.com/railwayapp/nixpacks/main/install.sh || true
                curl -fsSL https://railway.app/install.sh | RAILWAY_VERSION=latest sh -s -- --prefix "${env.WORKSPACE_ROOT}/.jenkins"
              fi

              export PATH="${env.WORKSPACE_ROOT}/.jenkins:\$PATH"
              railway --version

              # ── Map Jenkins TARGET_ENV → Railway environment name ─────────────
              case "${params.TARGET_ENV}" in
                dev)  RAILWAY_ENV="development" ;;
                qa)   RAILWAY_ENV="staging"     ;;
                prod) RAILWAY_ENV="production"  ;;
                *)    echo "Unknown TARGET_ENV: ${params.TARGET_ENV}"; exit 1 ;;
              esac

              echo "Deploying to Railway environment: \$RAILWAY_ENV"

              # ── Deploy the built static output ────────────────────────────────
              railway up \
                --service frontend \
                --environment "\$RAILWAY_ENV" \
                --detach \
                apps/web/dist
            """
          } else {
            // Windows agent fallback
            bat """
              npm install -g @railway/cli

              if "${params.TARGET_ENV}"=="dev"  set RAILWAY_ENV=development
              if "${params.TARGET_ENV}"=="qa"   set RAILWAY_ENV=staging
              if "${params.TARGET_ENV}"=="prod" set RAILWAY_ENV=production

              railway up --service frontend --environment %RAILWAY_ENV% --detach apps\\web\\dist
            """
          }
        }
      }
    }
  }

  post {
    success {
      archiveArtifacts artifacts: 'apps/web/dist/**', fingerprint: true
      echo "Deployment to Railway (${params.TARGET_ENV}) completed successfully."
    }

    failure {
      echo "Pipeline failed. The Railway deploy stage was skipped or errored."
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