package modules;

import org.pac4j.core.client.Clients;
import com.google.inject.AbstractModule;
import org.pac4j.oauth.client.FacebookClient;
import org.pac4j.oauth.client.GitHubClient;
import org.pac4j.http.client.indirect.FormClient;
import org.pac4j.http.credentials.authenticator.test.SimpleTestUsernamePasswordAuthenticator;
import org.pac4j.core.client.Clients;
import org.pac4j.core.config.Config;
import org.pac4j.core.authorization.RequireAnyRoleAuthorizer;
import org.pac4j.play.http.DefaultHttpActionAdapter;
import controllers.HttpActionAdapter;
import play.Configuration;
import play.Environment;

public class SecurityModule extends AbstractModule {

  private final Environment environment;
  private final Configuration configuration;

  public SecurityModule(Environment environment, Configuration configuration) {
      this.environment = environment;
      this.configuration = configuration;
  }

  @Override
  protected void configure() {

    // OAuth
    final String fbId = configuration.getString("fbId");
    final String fbSecret = configuration.getString("fbSecret");
    FacebookClient facebookClient = new FacebookClient(fbId, fbSecret);

    final String ghId = configuration.getString("ghId");
    final String ghSecret = configuration.getString("ghSecret");
    GitHubClient gitHubClient = new GitHubClient(ghId, ghSecret);

    // HTTP
    final FormClient formClient = new FormClient("/", new SimpleTestUsernamePasswordAuthenticator());

    Clients clients = new Clients("http://localhost:9000/callback", facebookClient, gitHubClient, formClient);

    Config config = new Config(clients);
    config.addAuthorizer("admin", new RequireAnyRoleAuthorizer("ROLE_ADMIN"));
    //config.addAuthorizer("custom", new CustomAuthorizer());
    config.setHttpActionAdapter(new HttpActionAdapter());
    bind(Config.class).toInstance(config);
  }
}
