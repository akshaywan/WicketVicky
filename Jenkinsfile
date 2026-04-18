pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
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
        }
      }
    }

    stage('Install') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Lint') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run lint'
          } else {
            bat 'npm run lint'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          def buildCommand = "npm run build:${params.TARGET_ENV}"

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
