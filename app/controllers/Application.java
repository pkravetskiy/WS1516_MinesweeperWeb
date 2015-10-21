package controllers;

import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;
import play.twirl.api.Html;
import de.htwg.se.minesweeper.Minesweeper;
import de.htwg.se.aview.gui.PlayingFieldPanel;
import de.htwg.se.controller.IController;
import de.htwg.se.model.IField;
import de.htwg.se.model.impl.Field;
import de.htwg.se.util.observer.Event;
import de.htwg.se.util.observer.IObserver;
import views.html.*;

public class Application extends Controller {
	static IController controller = new de.htwg.se.controller.impl.Controller(new Field());
	private Html text = new Html("<h1>QWERTZ</h1>");
    public Result index() {
    	String str = controller.getField();
    	text = new Html(str);
        return ok(views.html.index.render("Minesweeper", text));
    }

    public Result commandline(String command) {
    	Minesweeper.getInstance().getTui().processInputLine(command);
    	String str = controller.getField();
    	text = new Html(str);
    	return ok(views.html.index.render("Minesweeper", text));
    }
}
